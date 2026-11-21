---
name: qwik-v2-crud-pattern
description: The standard list/create/edit/delete screen in oceano-admin — zod schemas, a URL-driven list loader, one routeAction$ per operation with server-side access checks, a Dialog form, toasts from the action result. Use when building or porting any CRUD screen (e.g. /access staff and grants, /sites/rpn review queues).
---

# Qwik v2 CRUD pattern

**Hard rules:** work on the local `dev` branch in the main checkout (no git worktrees); never push or open a PR unless the user asks.

Read `qwik-v2-developer` (+ `references/data-layer.md`) and `qwik-v2-composable-ui` first. The first CRUD screens will be oceano-admin's `/access/*` (owner: staff, grants, audit) and the `/sites/rpn/*` module (`docs/architecture/multi-site-admin.md`). Helpers marked **(to be built)** are extracted by the first screen that needs them, into `src/lib/crud/`, and then reused; don't hand-roll a second copy.

**Ask first** (one batch, recommended option first): unclear HTTP verbs or payloads (check the backend controller), dropped behaviour when porting a screen (e.g. from the RPN web's `/manage/admin`), whether a screen needs anything beyond native forms.

## File layout
```
src/routes/<section>/<entity>/
  layout.tsx        # onRequest guard for the section (requireSite('<key>') / owner check, to be built)
  index.tsx         # list loader + one action per operation + page
src/components/modules/<section>/
  <entity>.schema.ts   # zod (from @qwik.dev/router): list query (with defaults), create, update, id-only; types via z.infer
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
- A `searchKeys(schema)` helper that derives `search` from the schema **(to be built)** once a second list exists.

## 3. Actions: one per operation
```ts
export const useUpdateStaff = routeAction$(async ({ id, ...body }, ev) => {
  // assert access first: the guard decided who sees the page, not who may write (requireOwner(ev), to be built)
  const [err, res] = await coreApi(ev).patch<ApiResponse<Staff>>(`/admin/staff/${id}`, body);
  return err ? ev.fail(err.status, { message: err.message }) : { message: res.message, data: res.data };
}, zod$(staffUpdate));
```
- Each action: access check → backend call → `ev.fail(status, { message })` or `{ message, data }`. Keep the backend's status so the UI can tell 401/403 from 4xx/5xx.
- Payload transforms happen in the action (server side), not in the component.
- Loaders re-run after an action; never patch the list in the browser. Socket events call `invalidate()`.
- Toasts: a small `useActionToast(action)` **(to be built)** that watches `action.value` and calls `useToast().add(message, failed ? 'error' : 'success')`; until then do it in a `useTask$` tracking `action.value`.

## 4. Form dialog
- Page state: `useStore<{ mode: 'add' | 'edit' | null; entity?: Staff }>({ mode: null })`; a row action cell (component reading a context) or toolbar button sets it.
- `<Dialog open={!!state.mode} closable title=…>` around a `<Form action={state.mode === 'add' ? create : update}>` with `Field`/`Label`/`Input`/`Select`/`Description`; hidden `<input type="hidden" name="id">` for edits. Errors: `action.value?.fieldErrors?.<name>`; failure: an `Alert` with `action.value.message`. Close the dialog when the action succeeds.
- Projected slot content outlives a conditional render, so key the form on the entity id (or an open counter) to drop stale values when it reopens.
- Dotted input names give nested objects (`grants.0.role`).

## 5. Access
- Section `layout.tsx`: `onRequest` guard (`requireStaff` for everything, `requireSite('<key>')` for a site module, owner-only for `/access`) **(to be built with Entra)**. Today the root `authGuard` is the only gate.
- **Every** mutating action re-checks access server side; the backend checks again. Hiding a button secures nothing.

## Checklist
- [ ] Query schema has a default for every param; the loader's `search` lists them all.
- [ ] List page follows `qwik-v2-composable-ui` › Table pages.
- [ ] Every HTTP verb and path checked against the backend controller.
- [ ] Every action: access check → backend → `ev.fail` / `{ message, data }`; the result reaches a toast or alert.
- [ ] Types from `z.infer`; no duplicate interfaces.
- [ ] Zero `.css`; UI from `~/components/ui`.
- [ ] `pnpm build.types`, `pnpm lint`, `pnpm build` pass; the screen checked in the browser at phone, tablet and desktop widths, light and dark.
