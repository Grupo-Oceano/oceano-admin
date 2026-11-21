---
name: qwik-v2-crud-pattern
description: The standard list/create/edit/delete screen in oceano-admin — zod schemas, a URL-driven list loader, one routeAction$ per operation with server-side access checks, a Dialog form, toasts from the action result. Use when building or porting any CRUD screen (e.g. /access staff and grants, /sites/rpn review queues).
---

# Qwik v2 CRUD pattern

**Hard rules:** work on the local `dev` branch in the main checkout (no git worktrees); never push or open a PR unless the user asks.

Read `qwik-v2-developer` (+ `references/data-layer.md`) and `qwik-v2-composable-ui` first. Reference screens: `/access` (owner: staff, grants, audit) and `/sites/rpn/*` (`docs/architecture/multi-site-admin.md`). Shared helpers live in `src/lib/crud/` (`errorMessage`, `searchKeys`/`searchObject`, `useActionToast`); reuse them, don't hand-roll a second copy.

**Ask first** (one batch, recommended option first): unclear HTTP verbs or payloads (check the backend controller), dropped behaviour when porting a screen (e.g. from the RPN web's `/manage/admin`), whether a screen needs anything beyond native forms.

## File layout
```
src/routes/<section>/<entity>/
  layout.tsx        # onRequest guard for the section (requireSite('<key>') / requireOwner)
  index.tsx         # list loader + one action per operation + page
src/features/<section>/
  schema.ts / contract.ts  # zod (from @qwik.dev/router): list query (with defaults), create, update, id-only; types via z.infer
  errors.ts                # backend error codes → sentences (errorMessage)
src/components/modules/<section>/
  <entity>.columns.tsx # DataTable columns + custom cell components
  <entity>-dialog.tsx  # Dialog + <Form> fields, only if the page gets crowded
src/lib/backends/<backend>.server.ts   # the backend client; entity calls are small functions next to it or in the route
```

## 1. Schemas
- One zod schema per operation, `import { z } from '@qwik.dev/router'`. Types come from `z.infer`; no interface duplicating a schema, no DTO mappers.
- The list query schema owns every default and coerces strings: `offset: z.coerce.number().int().min(0).catch(0)`, `take: …catch(10)`, filters `.catch('')`.

## 2. List loader
```ts
export const useStaff = routeLoader$(async (ev) => {
  const query = staffQuery.parse(Object.fromEntries(ev.url.searchParams));
  const { data, error } = loaderResult(ev, await coreApi(ev).get<ApiResponse<Staff[]>>('/admin/staff', query));
  return { query, rows: data?.data ?? [], total: data?.data.length ?? 0, error };
}, { search: ['offset', 'take', 'status'] });   // every param the schema reads
```
- Page behaviour while loading/failing: `qwik-v2-composable-ui` › Table pages (busy signal, inline error, Paginator `disabled`).
- `search: searchKeys(schema)` derives the list from the query schema.

## 3. Actions: one per operation
```ts
export const useUpdateStaff = routeAction$(async ({ id, ...body }, ev) => {
  // assert access first: the guard decided who sees the page, not who may write (isOwner(ev) / siteRoleOf(ev, key))
  const [err, res] = await coreApi(ev).patch<ApiResponse<Staff>>(`/admin/staff/${id}`, body);
  return err ? ev.fail(err.status, { message: err.message }) : { message: res.message, data: res.data };
}, zod$(staffUpdate));
```
- Each action: access check → backend call → `ev.fail(status, { message })` or `{ message, data }`. Keep the backend's status so the UI can tell 401/403 from 4xx/5xx.
- Payload transforms happen in the action (server side), not in the component.
- Loaders re-run after an action; never patch the list in the browser. Socket events call `invalidate()`.
- Toasts: `useActionToast(action)` on the **same instance** the `<Form>` uses (each `useXxx()` call is its own store). Map backend codes to sentences with `errorMessage` (see `features/access/errors.ts`, `features/rpn/errors.ts`).

## 4. Form dialog
- Page state: `useStore<{ mode: 'add' | 'edit' | null; entity?: Staff }>({ mode: null })`; a row action cell (component reading a context) or toolbar button sets it.
- `<Dialog open={!!state.mode} closable title=…>` around a `<Form action={state.mode === 'add' ? create : update}>` with `Field`/`Label`/`Input`/`Select`/`Description`; hidden `<input type="hidden" name="id">` for edits. Errors: `action.value?.fieldErrors?.<name>`; failure: an `Alert` with `action.value.message`. Close the dialog when the action succeeds.
- Projected slot content outlives a conditional render, so key the form on the entity id (or an open counter) to drop stale values when it reopens.
- Dotted input names give nested objects (`grants.0.role`).

## 5. Access
- Section `layout.tsx`: `onRequest` guard from `lib/auth/guard.server.ts` (`requireStaff` in `(app)`, `requireSite('<key>')` for a site module, `requireOwner` for `/access`). A denied section renders `<Forbidden>` with status 403; its loaders return empty data when the check fails.
- Actions re-check with `isOwner(ev)` / `siteRoleOf(ev, key)` (site modules: `rpnWrite` in `features/rpn/actions.server.ts`).
- **Every** mutating action re-checks access server side; the backend checks again. Hiding a button secures nothing.

## Checklist
- [ ] Query schema has a default for every param; the loader's `search` lists them all.
- [ ] List page follows `qwik-v2-composable-ui` › Table pages.
- [ ] Every HTTP verb and path checked against the backend controller.
- [ ] Every action: access check → backend → `ev.fail` / `{ message, data }`; the result reaches a toast or alert.
- [ ] Types from `z.infer`; no duplicate interfaces.
- [ ] Zero `.css`; UI from `~/components/ui`.
- [ ] `pnpm build.types`, `pnpm lint`, `pnpm build` pass; the screen checked in the browser at phone, tablet and desktop widths, light and dark.
