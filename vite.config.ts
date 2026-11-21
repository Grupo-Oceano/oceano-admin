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
  // Dev only: in production nginx proxies /socket.io to oceano-core (nginx.conf). The app calls oceano-core
  // server side (CORE_API_URL); only the browser's Socket.IO connections go through this proxy.
  const env = loadEnv(mode, process.cwd(), "");
  const coreTarget = env.CORE_API_URL || "http://localhost:3000";

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
        // Same path nginx proxies in production (lib/realtime/socket.ts connects same-origin).
        "/socket.io": {
          target: coreTarget,
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
