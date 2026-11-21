---
name: qwik-v2-composable-ui
description: Rules and APIs for oceano-admin's composable UI lib (src/components/ui) — styling and colour strategy, responsive/touch rules, the native headless primitives (Button, Menu, Popover, Dialog, Field/Input/Select, Toast, Alert, DataTable, Paginator, Avatar), table pages, and the "lib before feature component" rule. Use when building any screen, list page or shared component.
---

# Composable UI: `src/components/ui`

**Hard rules:** work on the local `dev` branch in the main checkout (no git worktrees); never push or open a PR unless the user asks. Read `qwik-v2-developer` first.

The lib replaced flowbite-qwik, @qwik-ui/headless and @modular-forms/qwik (Qwik v1 only). It is small on purpose: add a primitive when a second screen needs the same shape, not before. `/home/ui-test` (the showcase route, `index@checkout.tsx`) renders every primitive; add new ones there.

## Layout and boundaries
```
src/components/ui/
  index.ts         the only entry the app imports: import { Button, DataTable } from '~/components/ui'
  theme.css        tokens + base layer (imported once by src/global.css)
  primitives/      button (Button, button()), icon, spinner, menu, popover, dialog, close-button;
                   helpers: anchor (pin/release via @floating-ui/dom), keyboard, panel
  forms/           field (Field, Label, Description), input, select
  feedback/        toast (ToastProvider, useToast), alert (Alert, ErrorState), skeleton
  data-view/       data-table (DataTable, table(), Column), paginator, avatar, get-path
  layout/          card(), heading(), divider()  (tv() class helpers)
src/components/shell/    app chrome that knows routes/session: Sidebar, Uppernav, UserMenu, NavLink, ThemeToggle, LoginLayout
src/components/modules/  per-section components (infrastructure, iot, backups)
```
- The lib knows nothing about routes, backends or the session: data comes in through props, actions through QRL props. Anything that needs `useLocation`, `Link` or a loader belongs in `components/shell` or a module.
- Every interactive part takes `testId` and renders it as `data-testid`.

## Styling: compose, don't write CSS
- **No `.css` in modules, shell or routes.** Tailwind utilities only. Raw CSS lives only in `theme.css`, with `/* why: */`.
- Lib components define looks with `tailwind-variants` (`tv()`) and accept `class`, merged through tailwind-merge (the consumer wins on conflicts). Export the `tv()` function too, so a `<Link>` or `<a>` can wear the same look: `<a href="…" class={button({ intent: 'success' })}>`.
- **Colours: Tailwind's stock palette, plus tokens only for surfaces and status.**
  - Palette classes always come with a `dark:` twin, same prefixes in the same order: `text-gray-700 dark:text-gray-200`, `hover:bg-sky-700 dark:hover:bg-sky-300`.
  - Tokens (re-point under `.dark`, no `dark:` needed): `surface` (cards, tables), `surface-raised` (dialogs, menus), `surface-2` / `surface-3` (subtle fills, hover), `success` / `warning` / `danger` / `info`. Opacity modifiers work (`bg-danger/10`). Don't add tokens for anything else.
  - Roles: body text `text-gray-700 dark:text-gray-200`; headings `text-gray-900 dark:text-white` (or `heading()`); secondary text `text-gray-500 dark:text-gray-400`; **primary accent `sky`** (`bg-sky-600 dark:bg-sky-400`, text on it `text-white dark:text-gray-900`); borders `border-gray-200 dark:border-gray-700`, fields `border-gray-300 dark:border-gray-600`; page background `bg-gray-200 dark:bg-gray-800`; shell panels `card({ tone: 'panel' })`.
- Dark mode is the `.dark` class on `<html>`, set during SSR from the `theme` cookie (`src/lib/theme.ts`, `entry.ssr.tsx`) and toggled by `ThemeToggle`.
- Icons: Material Symbols Rounded (font loaded in `root.tsx`): `<Icon icon="logout" class="text-xl" />`, or `<span class="material-symbols-rounded" aria-hidden="true">` inside lib components.
- Prefer v4 bare values (`min-h-50`, `size-11`) over brackets; arbitrary values only for computed sizes. A long class string repeated in 2+ places is a missing variant or helper: extract it.

## Responsive & touch: mobile first
Staff use the panel on laptops, and also on tablets and phones.
- Tailwind's default breakpoints and scales; unprefixed classes are the phone layout, `sm:`/`md:`/`lg:` grow from there.
- Use `h-dvh`/`min-h-dvh` for full-height UI. The page never scrolls sideways: wide tables scroll inside their own wrapper and hide low-priority columns with `hideBelow`.
- Touch targets ≥ 44px on coarse pointers (`pointer-coarse:min-h-11`, `pointer-coarse:size-11`), ≥ 8px apart (`gap-2`). Nothing depends on hover: every hover affordance has a focus/tap equivalent.
- Text inputs are `text-base` (16px) on phones so iOS doesn't zoom. Use the right `type`, `inputMode`, `autocomplete`.
- Native controls first (`<select>`, `<dialog>`, `popover`); they work before JS resumes and on touch.
- Known gap: the `/home` shell (fixed 10-column grid) is desktop-only today; making it responsive is its own change.

## Primitives (Headless UI's API, native underneath)
- **Button** — `intent` `primary | secondary | success | danger | ghost`, `size` `sm | md | icon`, `block`, `icon` (Material Symbol), `loading` (spinner, disabled), `type` defaults to `button`.
- **Menu** — `Menu` / `MenuButton` / `MenuItems anchor="bottom end"` / `MenuItem href|onClick$|type="submit" disabled` / `MenuHeading` / `MenuSeparator`. Arrow keys, Home/End, type-ahead, Esc. A `MenuItem type="submit"` inside a plain `<form method="post">` posts it (the user menu's "Log out").
- **Popover** — `Popover` / `PopoverButton` / `PopoverPanel anchor`; `CloseButton` closes the nearest popover or dialog.
- Panels are `popover="auto"` (top layer, light dismiss, Esc, one open at a time, no JS needed) placed by `pin()` (floating-ui: offset, flip, shift, max-height); `anchor` uses Headless UI's syntax (`'bottom start'`, `'top end'`). State shows as `data-open`; style with `data-*` variants.
- **Dialog** — native `<dialog>` + `showModal()` while `open` is true: `<Dialog open={sig.value} closable title onClose$ size="sm|md|lg">`; put actions in `<footer class={dialog().footer()}>`. Enter/leave animate with `@starting-style` (`starting:`/`open:` variants).
- **Field / Label / Description** — wire ids, `aria-describedby` and `invalid`/`disabled` to the control inside. In an invalid Field the Description reads as the error.
- **Input** — native `<input>` with optional leading `icon`; posts by `name` with the surrounding `<Form>`; `bind:value` when the value must live in a signal. **Select** — native `<select>` with the field look.
- **Toast** — `ToastProvider` is mounted once in `root.tsx`; `const { add } = useToast(); add(summary, 'success' | 'info' | 'warn' | 'error', detail?, lifeMs?)`.
- **Alert** — `<Alert tone="success|warning|danger|info|muted" icon title onDismiss$ role>`; **ErrorState** — the centred terminal error for a panel; **Skeleton**, **Spinner**, **Avatar** (`src` or initials from `name`).
- **Qwik gotchas the primitives already handle** (follow them in new ones):
  - `preventDefault` must be sync: `onKeyDown$={[preventNavKeys, $(handler)]}` (or `sync$`).
  - Don't combine `bind:value` with your own `onInput$` on one element.
  - Never capture `props` in a `$` closure when props hold components (`cell`): destructure the serializable parts first.
  - DOM work after a state change waits for the render (`focusSoon(root, selector)`).
  - A closed `<dialog>`/popover never intersects: browser-only setup there uses `useVisibleTask$(…, { strategy: 'document-ready' })`.

## DataTable
```ts
const CreatedAt = component$<{ row: Guest }>(({ row }) => <>{formatDateTime(row.createdAt)}</>);
const columns: Column<Guest>[] = [
  { key: 'fname', header: 'First Name' },                       // plain: prints the value at `key` (dotted path)
  { key: 'createdAt', header: 'Created At', cell: CreatedAt, hideBelow: 'md' }, // custom cell: a component$ of the row
];
<DataTable columns={columns} rows={rows} error={error} rowKey="id" testId="leads">
  <Paginator q:slot="footer" … />
</DataTable>
```
- `Column<T>`: `key`, `header`, `cell?` (component receiving `{ row }` — components serialize, functions don't), `hideBelow?` (`sm|md|lg`), `align?`, `class?` (td).
- Props: `rows` (`null` = loading placeholders), `loading`, `loadingRows`, `error` (inline error row, `<testId>-error`), `emptyText` (`<testId>-empty`), `rowKey` (dotted path → `key` and `data-row-id`), `flat` (inside a card), `testId`, `class`. Slots `toolbar` and `footer` render once: per-row content goes through `cell`, never a slot.
- A cell needing shared live state reads a context the table's parent provides (see `components/modules/iot/DevicesTable.tsx`); a cell needing actions uses `useToast()` or an action from context.
- Hand-rolled tables use `table()`'s slots (`scroller`, `tableEl`, `th`, `tr`, `td`) for the same look.

## Table pages
- The loader returns `{ query, rows, total, error }` using `loaderResult` (data-layer reference): a backend failure renders inside the table, the page and paginator stay.
- The URL owns the page (`?offset=&take=`, declared in the loader's `search`). The page keeps a `busy` signal around `await nav('?offset=…&take=…', { replaceState: true })`, dims the table and passes `disabled={busy.value}` to the `Paginator`. Reference: `routes/home/leads/index.tsx`.
- **Don't** swap the page for a skeleton on navigation, and don't use `useLocation().isNavigating` for a table's busy state (it is global).
- `Paginator`: `total`, `offset`, `take`, `takeOptions`, `onChange$({ offset, take })`, `disabled`, `testId`.

## The rule: lib before feature component
Before creating a component in a module folder, check in order:
1. Can an existing primitive's props or a new variant express it?
2. Can primitives be composed (Dialog + Field + Input, `card()` + DataTable)?
3. Will a second section use the same shape? Then add it to `src/components/ui` (and the showcase).
4. Only then a module component, with `// why: <custom workflow | unique visualization | placeholder>` on top.

## Checklist
- [ ] New UI shape → lib variant/primitive, or a module component with `// why:`.
- [ ] Nothing per-row inside named slots; custom cells are components.
- [ ] Props crossing into client code are serializable.
- [ ] Colours: stock Tailwind with a `dark:` twin, or a surface/status token; accent `sky`; no hex, no new tokens.
- [ ] Mobile first, ≥ 44px touch targets on coarse pointers, nothing hover-only, 16px inputs on phones, no sideways page scroll.
- [ ] No new `.css` outside `theme.css`; looks via `tv()`; `class` overrides go through tailwind-merge.
- [ ] `testId` wired on interactive parts; new primitives shown on `/home/ui-test`.
