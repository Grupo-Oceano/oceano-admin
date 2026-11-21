---
name: qwik-v2-developer
description: Core rules for writing Qwik v2 code (@qwik.dev/core, @qwik.dev/router) in oceano-admin — packages and config, state, async computed, loaders, actions, serialization, browser-only code, events, middleware, and where the data layer (backend clients, BFF auth, sockets) lives. Use for any Qwik v2 component, route, loader, action or refactor.
---

# Qwik v2 Developer

**Hard rules:** work on the local `dev` branch in the main checkout (no git worktrees); never push or open a PR unless the user asks.

Source of truth: the **Qwik MCP** (`@qwik.dev/mcp`, pinned to the app's version, configured in `.mcp.json`): `search_docs` / `get_doc` for APIs (`get_project_info` says whether the bundled docs match), `get_best_practices`, `list_routes`, and with `pnpm dev` running plus an open page, `get_dev_errors` / `inspect_page` (component tree, signals, serialized state — use before adding logging). Fallback: https://qwik.dev/docs (v2). When this skill and the docs disagree, the docs win; fix the skill.

The data layer (backend clients, BFF auth, sockets): `references/data-layer.md`. Read it before touching a loader, action, endpoint or middleware. Where the app is going: `docs/architecture/multi-site-admin.md`.

## 1. Packages & config
- Core `@qwik.dev/core`, router `@qwik.dev/router`. Never `@builder.io/*`, and no Qwik v1 libraries (flowbite-qwik, @qwik-ui/*, @modular-forms/qwik): they don't run on v2.
- Version `2.0.0-rc.4`: every `@qwik.dev/*` package on the same **exact** version, in `dependencies`. Upgrade them together.
- Router names: `useQwikRouter()` in `root.tsx`, `qwikRouter()` (vite), `createQwikRouter` (middleware), `createRenderer` (`entry.ssr.tsx`) — not the v1 `QwikCity*` names. There is no `@qwik-city-plan` import any more.
- `vite.config.ts`: `qwikMcp()` (dev only), `qwikRouter()`, `qwikVite()`, `tailwindcss()`. No experimental flags are on: enable `pendingBoundary` / `catchBoundary` in `qwikVite({ experimental: [...] })` before using `<Pending>` / `<Catch>`. Path alias `~/*` → `src/*` through `resolve.tsconfigPaths`.
- **Gotcha:** qwikVite rc.4 emits `includeDependenciesRecursively` per client `codeSplitting` group, which rolldown rejects; the `enforce: 'post'` plugin in `vite.config.ts` strips it. Remove it once Qwik stops emitting the key.
- The node adapter runs with `ssg: null`: every page is behind the auth guard and reads runtime env, so there is nothing to prerender.
- Env: server code reads `ev.env.get('NAME')` (process env in production; `.env` + shell env on the dev server). Never `process.env` in app code, never `import.meta.env` for secrets (it is inlined into client bundles).

## 2. The `$` rule & serialization
- Every lazy boundary ends in `$`: `component$`, `onClick$`, `useTask$`, `useComputed$`, `routeLoader$`, `routeAction$`, `server$`, `$()`.
- Anything captured by a `$` closure or stored in a signal/store must serialize: plain objects, arrays, primitives, Date, Map/Set, URL, signals, stores, QRLs, components. **Not** class instances, plain functions, DOM nodes, sockets, SDK clients.
- Non-serializable runtime objects → keep them local to a `useVisibleTask$`, or `noSerialize(value)` (`undefined` after resume; recreate in the browser).
- A QRL called during render returns a **Promise**: helpers used in JSX (formatters, colour maps) are plain functions or maps, never `$()`.
- Module-level imports are fine inside `$`. A module-level mutable `let` mutated from a `$` closure won't build.
- Don't give a destructured parameter its own default (`useX({ a = 1 } = {})`) when a `$` closure reads its names: the rc.4 optimizer drops them from the capture, and they throw `a is not defined` once the segment loads. Take `options = {}` and read it in the body.

## 3. State
- `useSignal` for primitives, `useStore` for objects (deep by default), `useComputed$` for derivations.
- **Async `useComputed$`** replaces `useResource$`/`<Resource>` (deprecated). Auto-tracking covers reads **before the first `await`**; after that use `track()`. There is no `.pending`/`.error`: reading `.value` suspends and re-throws, so render it inside `<Pending>`/`<Catch>` (enable the flags first) or give it an `initial`.
- Prefer `routeLoader$` over browser `fetch` for anything that needs a backend: the backends are called server side only (no token in the browser).
- **A `server$` called only from client-only code** (a `useVisibleTask$`, an event handler) is missing on the dev server: the SSR transform strips that code and its import, the module never loads there, and the call fails with `Q6 Dynamic import <hash> not found`. Declare such a `server$` in the module that calls it, or keep a side-effect import of its module. Production builds are unaffected.
- **`track(() => x)` re-runs the task when any signal read inside notifies, not when `x` changes.** A task that resets state keeps the last value it acted on and returns early when it is unchanged:
  ```ts
  const last = useSignal<string | undefined>();
  useTask$(({ track }) => {
    const id = track(() => props.entity?.id);
    if (id === last.value) return;
    last.value = id;
    resetForm();
  });
  ```
- **A `$` handler reads signals when it runs**, not the values the render captured: derive what it needs inside the handler.

## 4. Router data
### `routeLoader$` — server-only reads
- Export from `index.tsx` or `layout.tsx` only (re-export to share). Returns a signal; read `.value`.
- **A pure function of the URL** (path params + declared search params). Never read action state or request bodies.
- `search: [...]` declares the query params it reads (strict loaders): **an undeclared param never triggers a re-fetch**. Parse them with a zod schema that owns the defaults (`z.coerce.number().int().min(0).catch(0)`); see `routes/home/leads/index.tsx`.
- Failure: `throw ev.error(status, data)`, `throw ev.redirect(...)`, or — for panels and tables — return the error as data with `loaderResult` (`references/data-layer.md`).
- Compose with `await ev.resolveValue(otherLoader)`. Options: `search`, `cacheControl`, `eTag`, `serializationStrategy`, `validation`.
- Re-fetch: every SPA navigation, after actions, `signal.invalidate()` / `signal.clear()`.

### `routeAction$` — server-only writes
- Declared in `layout.tsx`/`index.tsx` (`globalAction$` anywhere). Invoke with `<Form action={action}>` (works without JS) or `await action.submit(data)`.
- Validate with `zod$(...)`. **Import `z` and `zod$` from `@qwik.dev/router`**; don't add `zod` as a dependency.
- Return `ev.fail(status, { message })` for failures; `action.value.failed`, `.message` and `.fieldErrors.<name>` drive the form (`routes/login/index.tsx`). `throw ev.redirect(302, …)` to navigate on success.
- Loaders re-run after an action; don't patch caches. Dotted input names (`site.key`, `items.0.qty`) become nested objects.
- UI state: `action.isRunning`, `action.status`, `action.value`, `action.formData`.
- Every mutating action re-checks the caller's access server side; hiding a button secures nothing.

### Middleware & endpoints
- `onRequest`/`onGet`/`onPost` in `layout.tsx` guard a subtree; the root `routes/layout.tsx` runs the auth guard for every route. Per-request data goes through `ev.sharedMap`.
- **A page's own `onRequest`/`onGet` don't run on SPA navigation** unless the page has a `routeLoader$`: a SPA navigation only requests the route's loaders. Put a leaf page's guard or redirect in the layout, or in a page `routeLoader$` the component reads (`throw ev.redirect(...)`).
- **Never a redirecting loader on an index page that has child routes**: the router runs that path's page loaders as guards when a layout is entered, so the redirect fires on every navigation below it. Redirect there in `onGet` (document requests) and, for SPA navigation, in the component.
- REST/JSON/file responses are endpoints (`onGet` in a route without a default export), e.g. `routes/home/leads/download/index.ts` streaming a CSV with `ev.send(new Response(body, { headers }))`.
- Trailing slashes are on (router default): `/login` 301s to `/login/`.

## 5. Browser-only code
- `useVisibleTask$` runs only in the browser; use it sparingly (sockets, `showModal()`, reading the DOM). A component that renders no element of its own (a context provider around `<Slot />`) or a closed `<dialog>`/popover never becomes visible: pass `{ strategy: 'document-ready' }`.
- `useTask$` runs on the server first; guard browser APIs with `isBrowser`.
- Never touch `window`, `localStorage` or `document` at module top level. Heavy browser libs (socket.io-client) are imported lazily inside the task.

## 6. Events
- Handlers run async, so `preventDefault()` inside `onClick$` is too late: use `preventdefault:click`, or `sync$()` for conditional sync logic (`onKeyDown$={[preventNavKeys, $(handler)]}`).
- The element is the handler's 2nd argument: `onInput$={(ev, el) => el.value}`.
- Don't combine `bind:value` with your own `onInput$` on one element: Qwik keeps one listener.

## Checklist
- [ ] No `@builder.io/*`, no v1 Qwik libraries, no `useResource$`/`<Resource>`.
- [ ] Every loader's `search` lists every query param it reads.
- [ ] Nothing non-serializable in stores/closures; no QRL called in render.
- [ ] Backends called only from loaders, actions, endpoints, middleware (`*.server.ts`); no token or secret in browser-reachable code.
- [ ] Auth/redirects in middleware or blocking loaders; actions re-check access.
- [ ] `pnpm build.types`, `pnpm lint` and `pnpm build` pass.
