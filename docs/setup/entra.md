# Entra setup: the "Oceano Admin" app registration

Oceano Admin (`admin.oceanorentals.net`) signs staff in with their Microsoft work account
(`@gooceano.com`). One app registration serves both sides:

- **oceano-admin** (the BFF) runs the sign-in (auth code + PKCE, confidential client) and asks for
  an access token for the registration's own API scope.
- **oceano-core** verifies that access token on every `/admin/*` call and decides who may do what.

Contract: [../architecture/multi-site-admin.md](../architecture/multi-site-admin.md).
Code: `src/lib/auth/*`, `src/routes/auth/*`, `src/routes/(app)/layout.tsx`.

## 1. Register the app (Entra admin center, gooceano.com tenant)

1. **App registrations → New registration**
   - Name: `Oceano Admin`
   - Supported account types: **Accounts in this organizational directory only** (single tenant).
   - Redirect URI: platform **Web**, `https://admin.oceanorentals.net/auth/callback`.
2. **Authentication** (platform **Web**, not SPA):
   - Redirect URIs (exact, no trailing slash):
     - `https://admin.oceanorentals.net/auth/callback`
     - `http://localhost:5173/auth/callback` (local `pnpm dev`)
     - add `https://<staging-host>/auth/callback` for any staging deployment
   - Front-channel logout URL: leave empty.
   - Post-logout: Entra only honours a `post_logout_redirect_uri` that matches a registered redirect
     URI, so also add
     `https://admin.oceanorentals.net/auth/signed-out` and `http://localhost:5173/auth/signed-out`
     as redirect URIs so `post_logout_redirect_uri` is accepted.
   - Implicit grant / hybrid flows: **both unchecked** (no access tokens, no ID tokens).
   - Allow public client flows: **No**.
3. **Expose an API**
   - Application ID URI: `api://<client-id>` (the default).
   - Add a scope: `access_as_user`, who can consent: **Admins only**, enabled. Display name e.g.
     "Use Oceano Admin as the signed-in staff member".
4. **Manifest**: set `"requestedAccessTokenVersion": 2` (shown as `accessTokenAcceptedVersion` in the
   older manifest view). v2 tokens carry `aud` = the client id GUID.
5. **API permissions** → Add a permission → **My APIs** → Oceano Admin → Delegated →
   `access_as_user`. Keep Microsoft Graph `User.Read` (default) or remove it; `openid` and `profile`
   are requested at sign-in. Then **Grant admin consent for gooceano.com**. Without consent staff get
   `consent_required` and the app shows "Microsoft didn't complete the sign-in".
6. **Certificates & secrets** → New client secret (e.g. 24 months). Copy the **Value** once into
   the secret store (Coolify env), never into the repo. Put the expiry date in the team calendar;
   rotating = add a new secret, deploy it, then delete the old one.
7. Optional: **Enterprise applications → Oceano Admin → Properties → Assignment required = Yes**
   and assign the staff group, to keep other tenant users from even reaching oceano-core. Without
   it anyone in the tenant can sign in and lands as `pending` (an owner then enables them in
   `/access`).

## 2. Environment

### oceano-admin (this app; runtime, server only)

| Variable               | Value                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `PUBLIC_ORIGIN`        | `https://admin.oceanorentals.net` (empty in local dev → `http://localhost:5173`)              |
| `ENTRA_TENANT_ID`      | Directory (tenant) id of gooceano.com                                                         |
| `ENTRA_CLIENT_ID`      | Application (client) id of "Oceano Admin"                                                     |
| `ENTRA_CLIENT_SECRET`  | The client secret value (**secret**)                                                          |
| `ENTRA_API_SCOPE`      | `api://<client-id>/access_as_user`                                                            |
| `ADMIN_SESSION_SECRET` | 32+ random bytes, e.g. `openssl rand -base64 32` (**secret**; rotating it signs everyone out) |
| `CORE_API_URL`         | `https://services.oceanorentals.net`                                                          |
| `RPN_API_URL`          | `https://api-staging.rockypoint.net/api/v1` (staging)                                         |

If any of the five Entra/session values is missing (or the session secret is shorter than 32
characters) every page shows **"Staff sign-in is not configured"**; nothing falls back to allowing.
See `.env.example`.

### oceano-core (verifies the tokens; no secret from this registration)

| Variable                                | Value                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| `ENTRA_TENANT_ID`                       | Same tenant id                                                                   |
| `ENTRA_API_AUDIENCE`                    | `<client-id>` (v2 tokens), optionally also `api://<client-id>` (comma-separated) |
| `ENTRA_REQUIRED_SCOPE`                  | `access_as_user` (default)                                                       |
| `CORE_OWNER_EMAILS`                     | `chuck@gooceano.com` (default; the master switch, re-applied on every sign-in)   |
| `CORE_STAFF_EMAIL_DOMAINS`              | `gooceano.com` (default)                                                         |
| `CORE_SIGNING_KEY` / `CORE_SIGNING_KID` | P-256 PKCS8 key for site tokens (**secret**; not Entra)                          |

oceano-core never needs `ENTRA_CLIENT_SECRET`; oceano-admin never needs the signing key.

## 3. Check it

1. Open `/` signed out → Microsoft sign-in → back on the page you asked for.
2. `chuck@gooceano.com` lands on the sites home as owner and sees **Access**.
3. Another `@gooceano.com` account lands on "Not enabled yet"; in `/access` (owner) it shows as
   **pending**; activate it and grant a site role; the user clicks "Try again".
4. Troubleshooting:
   - `/auth/sign-in/?error=entra`: Entra refused (assignment required, consent missing, wrong
     redirect URI). The server log has the Entra error code (`[auth] Entra returned an error`).
   - `?error=exchange`: wrong client secret, or the redirect URI differs from `PUBLIC_ORIGIN`.
   - `?error=rejected`: oceano-core answered 401 right after sign-in: `ENTRA_API_AUDIENCE` /
     tenant / scope on oceano-core don't match the token, or the manifest isn't v2.
   - `?error=unavailable`: oceano-core unreachable or `staff_auth_unconfigured` (503).
