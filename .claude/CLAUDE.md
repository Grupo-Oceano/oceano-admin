# oceano-admin

Oceano staff admin panel and **BFF** (`admin.oceanorentals.net`). Remote `Grupo-Oceano/oceano-admin`.
Where it is going: [docs/architecture/multi-site-admin.md](../docs/architecture/multi-site-admin.md)
(Entra sign-in, oceano-core as access authority, site modules such as RockyPoint.net).

## Stack
- Qwik v2 — `@qwik.dev/core` + `@qwik.dev/router` **2.0.0-rc.4** (exact, all `@qwik.dev/*` on the same version), node-server adapter (no SSG), Vite 8, Tailwind 4, `tailwind-variants` + `tailwind-merge`, `@floating-ui/dom`, `socket.io-client`.
- UI lib: `src/components/ui` (native primitives, imported via `~/components/ui`). No Qwik v1 libraries.
- Backends are called server side only, through `src/lib/backends/*.server.ts` (native fetch, `Result<T>` tuples). Today: oceano-core at `API_URL`, legacy username/password login (`auth` httpOnly cookie, guard in `src/routes/layout.tsx`).
- Production: Docker image runs nginx (port 80, proxies `/backbone/api` and `/socket.io` to `oceano-backbone:3000`) in front of `node server/entry.node-server.js` (port 3000).

## Commands (pnpm)
- `pnpm install` · `pnpm dev` (SSR dev server, http://localhost:5173; needs `API_URL` in `.env` or the shell for anything past /login)
- `pnpm build` (client `dist/` + server `server/`, then tsc + lint) · `pnpm build.types` · `pnpm lint` · `pnpm fmt`
- `pnpm serve` runs the production build (`PORT`, `API_URL`).

## Conventions
- Work on the **local `dev` branch** in the main checkout; no git worktrees. **Never push or open a PR unless asked.** Small logical commits are fine when asked to commit.
- **Never echo secrets**: read env var names, not values (`.env`, CI secrets, tokens).
- No token in the browser; every mutating action re-checks access server side.
- Before Qwik work load the skills: `qwik-v2-developer` (+ `references/data-layer.md`), `qwik-v2-composable-ui` for any UI, `qwik-v2-crud-pattern` for list/form screens. The Qwik MCP (`.mcp.json`) is the API source of truth.
- Agents: `platform-steward` (shared UI/lib/shell/auth), `module-builder` (one section), `admin-reviewer` (read-only review before committing).
- Done means `pnpm build.types`, `pnpm lint` and `pnpm build` pass, and touched pages were checked in the browser.
