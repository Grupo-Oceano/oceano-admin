# Oceano Admin: one panel for every site

Status: **agreed design, being implemented** (2026-11-20; permissions added 2026-11-21). This page is the contract between
oceano-admin, oceano-core and each site backend. When the code and this page disagree, fix one
of them in the same change.

## Goal

Oceano staff manage every site (RockyPoint.net businesses, later blogs and other sites) from a
single app, **admin.oceanorentals.net**, signing in with their Microsoft work account
(`@gooceano.com`). **chuck@gooceano.com** is the master (owner) account. From it, other staff are
enabled and given access to specific sites with a role per site.

## Pieces

| Piece | Domain | Role |
|-------|--------|------|
| **oceano-admin** (this repo, Qwik v2, node adapter) | `admin.oceanorentals.net` | The UI and a **BFF**: signs staff in with Entra, keeps tokens server side, calls the backends server to server. No token ever reaches the browser. |
| **oceano-core** (`Grupo-Oceano/oceano-core`, app `oceano-core`) | `services.oceanorentals.net` | **Primary backend + identity and access authority**: staff directory, owner flag, per-site grants, and the issuer of short-lived **site tokens** (JWKS published). Also its existing modules (IoT, captive portal, guests). |
| **Site backends** (first: RockyPoint.net API, repo `rockypoint-net`, `apps/api`) | each site's API subdomain, e.g. `api-staging.rockypoint.net` | Own their data and their admin endpoints. They **trust oceano-core site tokens** for staff calls; they no longer talk to Entra. |

```
Browser ── admin.oceanorentals.net (Qwik BFF) ──┬─ Entra (gooceano tenant): auth code + PKCE
                                                ├─ oceano-core  (Bearer: Entra access token)
                                                │     /admin/me, /admin/site-tokens, /admin/staff…
                                                └─ site API     (Bearer: core site token, aud site:<key>)
                                                      e.g. RPN /api/v1/admin/*
site API ── verifies site token with oceano-core JWKS (cached) ── services.oceanorentals.net/.well-known/jwks.json
```

## Authentication (who you are): Entra

- One app registration **"Oceano Admin"** in the `gooceano.com` tenant, single tenant.
  - Web platform redirect URI `https://admin.oceanorentals.net/auth/callback` (plus local
    `http://localhost:5173/auth/callback`). Post-logout redirect `https://admin.oceanorentals.net/auth/signed-out`.
  - Exposes the scope `api://<client-id>/access_as_user` (admins consent), `accessTokenAcceptedVersion: 2`.
  - Delegated permission to its own scope, admin consent granted. Client secret for the BFF.
- The BFF does auth code + PKCE server side (`@azure/msal-node`), asks for `ENTRA_API_SCOPE`, and
  keeps the **access token** in an encrypted httpOnly cookie (JWE dir/A256GCM, key = HKDF of
  `ADMIN_SESSION_SECRET`). When it expires (~60–90 min) the BFF sends the user through sign-in again
  (silent when the Microsoft session is alive). The same scheme already runs in the RPN web
  (`rockypoint-net/apps/web/src/lib/staff-auth/`); port it, don't reinvent it.
- **oceano-core** verifies the Entra access token (jose `createRemoteJWKSet`, RS256, issuers v1/v2 of
  the tenant, `aud` ∈ `ENTRA_API_AUDIENCE`, `tid` = tenant, `scp` ∋ `access_as_user`). Identity
  is the token's **`oid`**. Unconfigured → 503 `staff_auth_unconfigured`; never falls back to allow.

## Authorization (what you may do): oceano-core

Tables (oceano-core, `prisma-core`, schema `core_<env>`):

- `staff`: `id` uuid, `entra_oid` unique nullable (bound on first sign-in), `email` unique
  (lowercase), `name`, `status` (`pending` | `active` | `disabled`), `is_owner` bool, timestamps,
  `last_sign_in_at`.
- `sites`: `key` (pk, slug: `rpn`, …), `name`, `roles` text[] (allowed role names, e.g.
  `{admin,moderator}`), `active` bool. Seeded: `rpn` "RockyPoint.net" `{admin,moderator}`.
- `site_grants`: (`staff_id`, `site_key`) pk, `role` (must be in `sites.roles`), `granted_by`,
  `granted_at`.
- `access_audit`: append-only log of staff/grant/permission changes (actor, action, target,
  before/after json).
- `permissions`: catalog, `key` pk, `description`, `scope` (`global` | `site`). Seeded by migration:
  `access.manage` "Manage staff and their site access", scope `site`. Not editable through the API.
- `staff_permissions`: `id` uuid, `staff_id` → staff (cascade), `permission_key` → permissions
  (restrict), `site_key` → sites (cascade), **nullable: null = every site** (or "not applicable" for a
  `global` permission), `granted_by`, `granted_at`. Unique (`staff_id`, `permission_key`, `site_key`)
  **NULLS NOT DISTINCT** (Postgres 15+), so there is at most one all-sites row each. Migration
  `20261121000000_staff_permissions`.

Rules:

1. **Master/owner bootstrap**: `CORE_OWNER_EMAILS` (default `chuck@gooceano.com`). A verified
   sign-in whose email (`preferred_username`/`upn`/`email`, lowercased, must end in an allowed
   domain from `CORE_STAFF_EMAIL_DOMAINS`, default `gooceano.com`) is listed becomes `active` +
   `is_owner` and gets its `entra_oid` bound. Owners see and manage every site.
2. **Anyone else** in the tenant who signs in gets a `pending` row (so the owner sees the request)
   and `403 not_enabled` until an owner activates them and grants at least one site.
3. A row already bound to an `oid` only matches that `oid` (an email reassigned in Entra can't
   take over an account). A pre-created row (owner enabled `ana@gooceano.com` before her first
   sign-in) binds the `oid` on first sign-in.
4. `disabled` staff get `403 disabled`. Owners can't disable or demote themselves (keeps at least
   one owner).
5. Every change writes `access_audit` (`staff.*`, `grant.added|changed|revoked`,
   `permission.granted|revoked`).

### Permissions: access managers

A staff member holding `access.manage` is an **access manager**. Their scope S = the sites of their
rows, or every site if they have a null-site row. Code: oceano-core `access.policy.ts`
(`canManage(actor, action, target, site)`, pure and unit-tested); AccessService applies it to every
`/admin/*` call (OwnerGuard is no longer used there).

| Action | Owner | Access manager | Plain staff |
|---|---|---|---|
| `GET /admin/staff` | all | all rows, all grants and permissions (read) | `owner_only` |
| `GET /admin/sites` | all | only S | `owner_only` |
| `POST /admin/staff` (add) | yes | yes | `owner_only` |
| `PATCH status: active` | yes | only **pending** people (re-enabling a disabled person: `owner_only`) | `owner_only` |
| `PATCH status: disabled` | yes (not self) | yes | `owner_only` |
| `PATCH name` / `isOwner` | yes | `owner_only` | `owner_only` |
| `PUT/DELETE …/grants/:site` | yes | `site` ∈ S, else `outside_scope` | `owner_only` |
| permissions (list, grant, revoke) | yes | `owner_only` | `owner_only` |
| `GET /admin/audit` | yes | `owner_only` (simplest option; no filtered view) | `owner_only` |

Every manager action on a person is refused with `protected_staff` when the person is an owner,
holds `access.manage` (any scope), or is the manager themselves. Activating or disabling a person who
has a grant on a site outside S is `outside_scope`. Order of checks: not a manager → `owner_only`;
owner-only action → `owner_only`; protected person → `protected_staff`; scope → `outside_scope`.
`access.manage` gives **no site access**: site tokens are unchanged, a manager who should use a site
needs a grant on it. An active manager with no grant can still sign in (`/admin/me` doesn't answer
`not_enabled` to them) so they can reach `/access`.

### oceano-core endpoints (Bearer = Entra access token)

| Method + path | Who | Result |
|---|---|---|
| `GET /admin/me` | any verified staff | `{ staff: {id,email,name,isOwner,status}, sites: [{key,name,role}], permissions: [{key,site}], canManageAccess: {all,sites} }` (owner: every active site with role `owner`; `canManageAccess` for owners and all-sites managers is `all: true` + every site key, for site managers their keys, else `{all:false,sites:[]}`). Pending/disabled → 403 `not_enabled` / `disabled`. Updates `last_sign_in_at`. |
| `POST /admin/site-tokens` `{ site }` | staff with a grant on `site` (or owner) | `{ token, expiresAt }`. 403 `no_site_access`. |
| `GET /admin/sites` | owner, manager | sites with their roles (managers: only their scope) |
| `GET /admin/staff?status=` | owner, manager | staff with their grants and permissions |
| `POST /admin/staff` `{ email, name }` | owner, manager | pre-enables a person (`active`, no oid yet) |
| `PATCH /admin/staff/:id` `{ status?, name?, isOwner? }` | owner; manager for status (see table above) | activate / disable / promote |
| `PUT /admin/staff/:id/grants/:site` `{ role }` | owner; manager on their sites | grant or change a site role |
| `DELETE /admin/staff/:id/grants/:site` | owner; manager on their sites | revoke |
| `GET /admin/permissions` | owner | catalog `[{key,description,scope}]` |
| `PUT /admin/staff/:id/permissions/:key` `{ site: string \| null }` | owner | idempotent upsert of that scope row (`null` = every site); returns `{key,site,grantedBy,grantedAt}` |
| `DELETE /admin/staff/:id/permissions/:key?site=<key\|*>` | owner | revoke one scope row (`*` = the all-sites row); returns the revoked row |
| `GET /admin/audit?limit&cursor` | owner | access audit, newest first |
| `GET /.well-known/jwks.json` | public | public signing keys |

As built (oceano-core `feature/staff-access`): no global prefix. Success bodies are
`{ message, data }` (data = the payload above); errors are `{ message: "<code>" }` with the HTTP
status. Extra codes: 401 `missing_token` / `invalid_token`, 403 `identity_conflict` (email owned
by a row bound to another oid), 403 `owner_only`, 403 `outside_scope` (manager, site outside their
scope), 403 `protected_staff` (manager acting on an owner, another manager or themselves), 403 `cannot_disable_self` /
`cannot_demote_self`, 409 `last_owner`, 409 `staff_exists`, 400 `email_domain_not_allowed` /
`invalid_role` / `invalid_permission_scope` (a `global` permission given a site), 404
`staff_not_found` / `site_not_found` / `grant_not_found` / `permission_not_found` /
`permission_grant_not_found`, 503
`site_tokens_unconfigured`. An active non-owner with no grant on an active site also gets 403
`not_enabled`. `CORE_OWNER_EMAILS` is re-applied on every sign-in (the env list is the master
switch). Staff list items: `{id,email,name,status,isOwner,entraOid,lastSignInAt,createdAt,updatedAt,grants:[{site,role,grantedBy,grantedAt}],permissions:[{key,site,grantedBy,grantedAt}]}` (`site` null = every site);
audit page: `{items:[{id,actorId,action,targetType,targetId,before,after,createdAt}], nextCursor}`.
Audit targets: staff `<staffId>`, grant `<staffId>:<site>`, permission `<staffId>:<key>:<site or *>`.

## Site tokens (core → site backends)

- JWT, **ES256**, header `kid`. Private key: `CORE_SIGNING_KEY` (PKCS8 PEM, env, secret);
  `CORE_SIGNING_KID`. Optional `CORE_SIGNING_PREVIOUS_PUBLIC_KEY` + kid stay in the JWKS during a
  rotation.
- Claims: `iss` = `CORE_TOKEN_ISSUER` (`https://services.oceanorentals.net`), `aud` = `site:<key>`
  (e.g. `site:rpn`), `sub` = core staff id, `oid`, `email`, `name`, `site`, `role` (the site
  role; owners get the site's highest role, the first entry of `sites.roles`, e.g. `admin`),
  `owner` bool, `iat`, `exp` = 10 minutes, `jti`.
- A site backend verifies with `createRemoteJWKSet(<core>/.well-known/jwks.json)`, checks `iss`,
  `aud`, `site`, and maps `role` to its own permissions. It may keep a local staff row keyed on
  `oid` (RPN does, for reviewer history), **upserted from the token**: authorization is core's.
  Revocation lag = token lifetime (≤ 10 min).
- The BFF caches site tokens in server memory per (staff, site) until 60 s before `exp`.

## oceano-admin structure

- Qwik v2 (`@qwik.dev/core` / `@qwik.dev/router`), node adapter, Tailwind 4, `tailwind-variants`.
  Skills in `.claude/skills/qwik-v2-*` are the coding contract.
- `src/lib/auth/`: Entra BFF (login, callback, logout, session cookie), `requireStaff` guard.
- `src/lib/backends/`: one client per backend (`core`, `rpn`, …): native `fetch`, base URL from
  env (`CORE_API_URL`, `RPN_API_URL`), Bearer from the session (core) or from a site token (sites).
  `Result<T>` tuples, plain objects only.
- Routes: `/` sites home (only the sites you have), `/access/*` (owners and access managers: staff,
  grants; owners also permissions and audit),
  `/sites/rpn/*` (RockyPoint.net: review queue, request detail, Escapia keying queue), existing
  modules (IoT, leads, infrastructure, backups) under their own sections.
- A site module's layout guards with `requireSite('rpn')` (no grant → 403 page); actions re-check
  server side. The site backend checks again: the BFF is not the security boundary.

As built (oceano-admin `dev`, 2026-11-20): sign-in routes `/auth/login` (a page: document requests
redirect to Entra, SPA arrivals reload), `/auth/callback`, `POST /auth/logout`, `/auth/signed-out`,
`/auth/sign-in` (`?error=entra|expired|state|exchange|session|rejected|unavailable`, and "not
configured"), `/auth/not-enabled` (`?reason=not_enabled|disabled|identity_conflict`). Cookies:
`oa_session` (chunked `oa_session.1/.2`, path `/`, httpOnly, SameSite=Lax, Secure on https,
expires 60 s before the token) and `oa_login` (10 min, path `/auth/callback`). The guard is the
`onRequest` of `src/routes/(app)/layout.tsx` (+ `layout-checkout.tsx`); `GET /admin/me` is cached
10 s per token; a 401 within 2 min of sign-in shows `?error=rejected` instead of looping. The legacy
modules moved from `/home/*` to `/dashboard`, `/infrastructure`, `/backups`, `/iot`, `/leads`,
`/ui-test` (old URLs 301) and are visible to **every signed-in staff member** for now (no
per-module grant yet). `/access` is for owners and access managers (`requireAccessManager`, nav and
home tile from `canManageAccess`); `/access/audit` is owners only. The staff dialog shows each viewer
only the controls core would accept from them (`src/features/access/policy.ts`, mirroring
`canManage`): managers get grant rows for their sites only (other sites' roles read-only), the
status button only when allowed, no owner or permission controls, and protected people read-only;
owners get a Permissions section to grant/revoke `access.manage` for one site or all sites. Every
action re-checks in the BFF (owner or manager) and again in core. `/sites/rpn` needs an `rpn` grant (owners pass).
Setup: [../setup/entra.md](../setup/entra.md).

## Environment (oceano-admin)

| Variable | Value |
|---|---|
| `PUBLIC_ORIGIN` | `https://admin.oceanorentals.net` (runtime; builds redirect URIs, Secure cookies) |
| `ENTRA_TENANT_ID` | gooceano tenant id |
| `ENTRA_CLIENT_ID` / `ENTRA_CLIENT_SECRET` | "Oceano Admin" registration (secret) |
| `ENTRA_API_SCOPE` | `api://<client-id>/access_as_user` |
| `ADMIN_SESSION_SECRET` | 32+ random bytes (secret) |
| `CORE_API_URL` | `https://services.oceanorentals.net` |
| `RPN_API_URL` | `https://api-staging.rockypoint.net/api/v1` (staging) |

## Migration of the RockyPoint.net staff panel

The RPN web's `/manage/admin` panel and its Entra sign-in (`apps/web/app/api/auth/entra/*`,
`src/lib/staff-auth/*`, `app/[locale]/manage/admin`, `app/[locale]/auth/staff`) move here as the
`/sites/rpn` module and are then deleted from the RPN web. The RPN API keeps its admin endpoints;
its `StaffGuard` switches from Entra tokens to core site tokens (`aud site:rpn`), upserting
`staff` by `msal_id = oid`. The RPN Entra env vars are replaced by `CORE_JWKS_URL` /
`CORE_TOKEN_ISSUER`.
