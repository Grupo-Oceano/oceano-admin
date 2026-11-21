# Data layer: backend clients, BFF auth, sockets

oceano-admin is a **BFF**: the browser talks only to this app; this app's server talks to the backends.
The target design is `docs/architecture/multi-site-admin.md` (Entra sign-in, oceano-core as the access
authority, one client per backend). Parts marked **(to be built)** come with the auth phase; follow the
current code until then, and don't add a third pattern. Paths are under `src/`.

## Rules (now and later)
1. **No token in the browser.** Tokens live in httpOnly cookies and server memory. Loaders return plain data
   without tokens or passwords (the guard exposes `{ username }` only). Browser code never calls a backend
   directly; the old `/backbone/api` browser proxy (nginx + Vite) stays only for compatibility and is not used by the app.
2. **One client per backend**, created per request from the request event, base URL from env:
   `coreApi(ev)` (oceano-core, `API_URL` today, `CORE_API_URL` later), one per site API (`rpnApi(ev)`, `RPN_API_URL`) **(to be built)**.
3. Clients use native `fetch`, return `Result<T>` tuples (`[ApiError, null] | [null, T]`) and never throw.
   Results are plain objects (they get serialized).
4. Clients are `*.server.ts` modules: import them only from loaders, actions, endpoints and middleware
   (eslint blocks value imports from components).
5. Files and blobs go through endpoints (`onGet`) that stream the backend response, so auth stays server side.
6. Authorization is checked three times: the guard/layout (who may see the page), every action (who may
   write), and the backend itself. The BFF is not the security boundary.

## Backend clients — `lib/backends/`
- `client.server.ts`: `createBackend({ baseUrl, envName, headers, timeoutMs })` → `get(path, query?)`, `post`,
  `put`, `patch`, `delete` (JSON, 10 s timeout) and `raw(path, init)` (the `Response`, for streaming; throws when
  unreachable). Missing base URL → `503 "<ENV> is not configured"`; network failure → `502`; non-2xx →
  `{ status, message }` from the body's `message` (Nest's string or list).
- `core.server.ts`: `coreApi(ev)` — base `ev.env.get('API_URL')`, forwards the `auth` cookie as
  `Authorization: Bearer` (legacy; oceano-core's current endpoints don't require it). With Entra it sends the
  session's Entra access token **(to be built)**.
- `types.ts`: `ApiError`, `Result<T>`, oceano-core envelopes `ApiResponse<T, U>` (`{ data, message } & U`) and
  `ApiGetAllResponse<T>` (`{ data, total, message }`).
- `unwrap.server.ts`: `loaderResult(ev, result)` → `{ data, error }`; a 401 redirects to `/login`, anything else
  comes back as `error` so the table/panel renders it in place (see `qwik-v2-composable-ui` › Table pages).
- Paged lists: oceano-core takes `/<resource>/<offset>/<take>`; the page keeps `offset`/`take` in the URL.

### Site backends (to be built)
- `rpn.server.ts`: base `RPN_API_URL`; Bearer = a **site token** from `POST <core>/admin/site-tokens { site: 'rpn' }`.
- `site-token.server.ts`: cache site tokens in server memory per (staff id, site) until 60 s before `exp`.
- Site APIs verify the token (ES256, `aud site:<key>`) against oceano-core's JWKS; a 403 means no grant.

## Auth — `lib/auth/`, `routes/layout.tsx`, `routes/login/`, `routes/logout/`
### Now: legacy username/password
- `cookies.ts`: `AUTH_COOKIE = 'auth'` (oceano-core JWT, 24 h), `authCookieOptions(url)`: `path /`, httpOnly,
  `sameSite lax`, `secure` on https.
- `routes/login/index.tsx`: `useLogin` routeAction$ + zod$ → `POST /auth/login` → sets the cookie → redirect `/home`.
- `guard.server.ts`: `authGuard` is the root layout's `onRequest`. Token → `POST /auth/check-token` (cached 5 min
  per token) → `sharedMap[SESSION_USER] = { username }`, `Cache-Control: private, no-store`; `/` and `/login`
  redirect to `/home`. No valid token → everything but `/login` redirects to `/login`.
- `routes/home/layout.tsx`: `useUser` loader reads the user from `sharedMap`.
- `routes/logout/index.ts`: `onPost` deletes the cookie, clears the guard cache, redirects to `/login`
  (a plain `<form method="post" action="/logout">`).

### Target: Entra BFF (to be built; replaces the above)
- One "Oceano Admin" app registration (gooceano.com tenant). The BFF runs auth code + PKCE server side
  (`@azure/msal-node`): `routes/auth/login`, `routes/auth/callback`, `routes/auth/logout`, `/auth/signed-out`.
  Port the scheme from `rockypoint-net/apps/web/src/lib/staff-auth/`; don't reinvent it.
- Session: the Entra **access token** (scope `ENTRA_API_SCOPE`) in an encrypted httpOnly cookie (JWE dir/A256GCM,
  key = HKDF of `ADMIN_SESSION_SECRET`). Expired → send the user through sign-in again (silent while the
  Microsoft session lives).
- `requireStaff` (root/app layout `onRequest`): decrypt the session, `GET <core>/admin/me` (short per-request
  cache) → `{ staff, sites }` in `sharedMap`; 403 `not_enabled` / `disabled` → an explanation page, not a loop.
- `requireSite('rpn')` in a site module's `layout.tsx`: no grant → 403 page. Owners see every site.
  Actions re-check the role server side.
- Env: `PUBLIC_ORIGIN`, `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `ENTRA_API_SCOPE`,
  `ADMIN_SESSION_SECRET`, `CORE_API_URL`, `RPN_API_URL`. Secrets never get a `PUBLIC_`/`VITE_` prefix.

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
