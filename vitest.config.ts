/**
 * Unit tests for the pure server-side parts (auth sealing, return-to, caches, error maps, query schemas).
 * No Qwik plugin: components and routes are checked by `pnpm build` and in the browser.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
