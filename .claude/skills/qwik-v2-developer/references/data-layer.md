# Data layer: backend clients, BFF auth, sockets

oceano-admin is a **BFF**: the browser talks only to this app; this app's server talks to the backends.
The design is `docs/architecture/multi-site-admin.md` (Entra sign-in, oceano-core as the access authority,
one client per backend). Paths are under `src/`.

## Rules
1. **No token in the browser.** The Entra token lives in an encrypted httpOnly cookie and, per request, in
   `ev.sharedMap` (server memory). Loaders return plain data without tokens (`useSession` → `{ staff, sites }`).
   Browser code never calls a backend directly.
2. **One client per backend**, created per request from the request event, base URL from env:
   `coreApi(ev)` (oceano-core, `CORE_API_URL`), `rpnCall(ev, fn)` (RockyPoint.net, `RPN_API_URL`).
3. Clients use native `fetch`, return `Result<T>` tuples (`[ApiError, null] | [null, T]`) and never throw.
   Results are plain objects (they get serialized).
4. Clients are `*.server.ts` modules: import them only from loaders, actions, endpoints and middleware
   (eslint blocks value imports from components).
5. Files and blobs go through endpoints (`onGet`) that stream the backend response, so auth stays server side.
6. Authorization is checked three times: the guard/layout (who may see the page), every action (who may
   write), and the backend itself. The BFF is not the security boundary.
7. Env is read at request time with `ev.env.get` (never `import.meta.env`): one image serves every environment.

## Backend clients — `lib/backends/`
- `client.server.ts`: `createBackend({ baseUrl, envName, headers, timeoutMs })` → `get(path, query?)`, `post`,
  `put`, `patch`, `delete` (JSON, 10 s timeout) and `raw(path, init)` (the `Response`, for streaming; throws when
  unreachable). Missing base URL → `503 "<ENV> is not configured"`; network failure → `502`; non-2xx →
  `{ status, message }` from the body's `message` (Nest's string or list; oceano-core sends `{ message: "<code>" }`).
- `core.server.ts`: `coreApi(ev)` — base `CORE_API_URL`, Bearer = the session's Entra access token
  (`sharedMap[ACCESS_TOKEN]`, set by the guard). oceano-core has no global prefix; success bodies are
  `{ message, data }`.
- `site-token.server.ts` + `site-token-cache.ts`: `getSiteToken(ev, site)` → `POST <core>/admin/site-tokens { site }`,
  cached in server memory per (staff id, site) until 60 s before `expiresAt`, one in-flight request per key.
  A site missing from the session's `sites` fails locally with 403 `no_site_access`.
- `rpn.server.ts`: `rpnCall(ev, (api) => api.get(...))` — base `RPN_API_URL` (includes `/api/v1`), Bearer = the
  rpn site token; a 401 drops the cached token and retries once. RPN bodies have no envelope.
- `types.ts`: `ApiError`, `Result<T>`, oceano-core envelopes `ApiResponse<T, U>` and `ApiGetAllResponse<T>`.
- `unwrap.server.ts`: `loaderResult(ev, result, { message?, signInOn401? })` → `{ data, error }`; an oceano-core 401
  sends the user through sign-in and back; site APIs pass `signInOn401: false` (their 401 is a setup problem;
  re-signing would loop). `message` maps the error to a sentence.
- Paged lists: legacy oceano-core takes `/<resource>/<offset>/<take>`; the access audit and the RPN queues use
  keyset `cursor` / `nextCursor` in the URL.

## Auth — `lib/auth/`, `routes/auth/*`, `routes/(app)/layout.tsx`
- One "Oceano Admin" app registration (gooceano.com tenant); setup in `docs/setup/entra.md`. Ported from
  `rockypoint-net/apps/web/src/lib/staff-auth/`.
- `config.ts`: `readAuthConfig(get)` (null when any of ENTRA_TENANT_ID, ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET,
  ENTRA_API_SCOPE, ADMIN_SESSION_SECRET (32+) is missing → "Staff sign-in is not configured", never allow),
  `publicOrigin` (`PUBLIC_ORIGIN`, else the request origin), cookie names.
- `seal.ts`: JWE dir/A256GCM, key = HKDF-SHA256(ADMIN_SESSION_SECRET, per-purpose label), deflated JSON, `exp`
  checked; cookie chunking (3 × 3800 bytes max). `session.server.ts`: read/write/clear `oa_session` and the
  single-use `oa_login` transaction (state, nonce, PKCE verifier, returnTo; 10 min, path `/auth/callback`).
- `msal.server.ts`: a new `ConfidentialClientApplication` per request (no shared token cache), scopes
  `[ENTRA_API_SCOPE, openid, profile]`, Entra logout URL. `return-to.ts`: same-origin path allow-list (no `/auth/*`).
- Routes: `/auth/login` (page; `onGet` → Entra; SPA arrivals reload), `/auth/callback` (state check, code + PKCE
  redemption, session cookie), `POST /auth/logout` (clear, then Entra logout → `/auth/signed-out`),
  `/auth/sign-in?error=`, `/auth/not-enabled?reason=`.
- `guard.server.ts`: `requireStaff` (the `(app)` layouts' `onRequest`): session → `GET <core>/admin/me` (cached
  10 s per token) → `sharedMap[SESSION] = { staff, sites }`, `sharedMap[ACCESS_TOKEN]`; no/expired session →
  `/auth/login?returnTo=`; 401 → sign in again (fresh session → `?error=rejected`); 403
  not_enabled/disabled/identity_conflict → `/auth/not-enabled`; other errors → `?error=unavailable`.
  `requireOwner`, `requireSite(key)` mark the section denied (status 403, `Forbidden` view); actions use
  `isOwner(ev)` / `siteRoleOf(ev, key)`. `forgetToken` (sign-out) drops the caches.

## Socket.IO — `lib/realtime/socket.ts`
- `connectSocket(namespace)` lazily imports `socket.io-client` and connects to same-origin `/<namespace>`
  (`/socket.io` path, proxied to oceano-core by nginx in production and Vite in dev). Namespaces and event
  names: `WSNamespace`, `WSEvent`.
- Open **one socket per section** inside a browser-only `useVisibleTask$` (with `{ strategy: 'document-ready' }`
  on a provider without its own element), write incoming data into a store, `disconnect()` in the task's cleanup.
  The socket object stays local to the task (it doesn't serialize). Examples: `lib/stores/infrastructure-store.tsx`
  (`oceano-infra`: services, metrics, connection status), `components/modules/iot/DevicesTable.tsx` (`iot`: one
  socket for every device row).
- When sockets start carrying authorization changes, events should `invalidate()` loaders instead of patching state.
