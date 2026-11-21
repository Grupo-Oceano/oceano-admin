/**
 * Base Vite config. The node-server adapter config extends it for the server build.
 * qwikRouter starts the app from `src/entry.ssr.tsx`, not from `index.html`.
 */
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikMcp } from "@qwik.dev/mcp";
import { qwikRouter } from "@qwik.dev/router/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin, type UserConfig } from "vite";

/**
 * qwikVite 2.0.0-rc.4 sets `includeDependenciesRecursively` on each client `codeSplitting` group, a key
 * rolldown 1.0 accepts only at the top level (where Qwik also sets it to `false`), so the build warns
 * "Invalid output options". Removing the per-group copies leaves the effective chunking unchanged.
 * Remove this plugin once Qwik stops emitting the key.
 */
function stripGroupIncludeDependenciesRecursively(): Plugin {
  return {
    name: "oceano:strip-group-include-dependencies-recursively",
    enforce: "post",
    config(config) {
      const output = config.build?.rolldownOptions?.output;
      for (const options of Array.isArray(output) ? output : [output]) {
        const codeSplitting = options?.codeSplitting;
        if (typeof codeSplitting !== "object") continue;
        for (const group of codeSplitting.groups ?? []) {
          Reflect.deleteProperty(group, "includeDependenciesRecursively");
        }
      }
    },
  };
}

export default defineConfig(({ mode }): UserConfig => {
  // Dev only: in production nginx serves /backbone/api and /socket.io (nginx.conf).
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.API_URL || "http://localhost:3000";

  return {
    plugins: [
      // Dev server only (`apply: 'serve'`): page inspection and dev errors for the Qwik MCP server.
      qwikMcp(),
      qwikRouter(),
      qwikVite(),
      tailwindcss(),
      stripGroupIncludeDependenciesRecursively(),
    ],
    resolve: { tsconfigPaths: true },
    server: {
      headers: {
        // Don't cache the server response in dev mode
        "Cache-Control": "public, max-age=0",
      },
      proxy: {
        // Same paths nginx proxies in production, so browser code can keep using them.
        "/backbone/api": {
          target: apiTarget,
          rewrite: (path) => path.replace(/^\/backbone\/api/, ""),
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: apiTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    preview: {
      headers: {
        // Do cache the server response in preview (non-adapter production build)
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
