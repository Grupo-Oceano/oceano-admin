# Plan: Oceano Rentals and Pazifica modules

Status: **planned, not started** (2026-11-21). Follows the pattern in
[../architecture/multi-site-admin.md](../architecture/multi-site-admin.md). The RockyPoint.net
module (`/sites/rpn`) is the reference implementation.

## Decision

Oceano Rentals and Pazifica are **two separate sites** in oceano-admin, each with its own module,
its own access grants and its own API subdomain. They are served today by one backend
(`Grupo-Oceano/oceano-rentals`, NestJS API, Coolify `sc2krhtscejfenwmpnpq8agl` prod /
`j0oows00gcw04oc44oc4cw8s` staging), but the admin treats them as independent sites.

| | Oceano Rentals | Pazifica |
|---|---|---|
| Site key (oceano-core `sites`) | `oceano-rentals` | `pazifica` |
| Admin module | `/sites/oceano-rentals` | `/sites/pazifica` |
| Token audience | `site:oceano-rentals` | `site:pazifica` |
| API, production | `api.oceano-rentals.com` | `api.pazifica.com` |
| API, staging | `api-staging.oceano-rentals.com` | `api-staging.pazifica.com` |
| oceano-admin env | `RENTALS_API_URL` | `PAZIFICA_API_URL` |

Staging hostnames are one level under the zone (`api-staging.`, not `api.staging.`) because the
Cloudflare Free edge certificate and our origin certificate only cover `*.<zone>`.

## Today (why this is needed)

The API has no hostname of its own. It is reachable only through the web's `/backend/*` rewrite on
`oceano-rentals.com`, `pazifica.com` and their staging hosts, and the edge blocks every `/backend`
path except `/backend/graphql` and `/backend/api`. Internally the web uses the alias
`http://oceano-rentals-api-production:3000` (staging `oceano-rentals-api-staging:3001`).

## Steps

1. **Infra** (oceano-infra agent, `oceano-general-infra`):
   - Add four `apps.yml` routes (prod on Master + on-prem like the rentals web, staging on-prem):
     `api.oceano-rentals.com`, `api.pazifica.com`, `api-staging.oceano-rentals.com`,
     `api-staging.pazifica.com`, health `/api/health`, with the rentals security headers, rate
     limit and in-flight middlewares. No Cloudflare Access (server-to-server calls from the BFF).
   - Add the domains to the Coolify API apps.
   - Add rows to `docs/subdomains.md`.
2. **oceano-core**: seed sites `oceano-rentals` and `pazifica` with their roles (to be agreed;
   proposal `{admin,editor}`) in a new migration.
3. **oceano-rentals API**:
   - A staff guard that verifies oceano-core site tokens (ES256, core JWKS, `iss`, `aud`), the same
     approach as the RPN API `StaffGuard`.
   - The API must know which brand a request is for. Either it derives it from the host
     (`api.pazifica.com` → pazifica) or from the token's `site` claim. **The token claim wins**:
     a token for `site:pazifica` must never act on Oceano Rentals data, whatever the host.
   - Admin endpoints for what the modules need, scoped by brand.
4. **oceano-admin**:
   - Two modules, `src/features/oceano-rentals` and `src/features/pazifica`, routes under
     `/sites/<key>`, guarded by `requireSite('<key>')`. Each gets its own site token.
   - If the screens are identical, share the components in a common feature folder and keep two
     thin route trees, so access, nav and URLs stay per site.
5. **Docs**: update the contract doc's sites table and the env table.

## Open questions

- What each module manages first (properties, reviews, deals, blogs, leads?).
- Role names per site.
- Does the rentals API already separate data by brand, or does that need adding first?
