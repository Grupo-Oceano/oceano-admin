import { nodeServerAdapter } from "@qwik.dev/router/adapters/node-server/vite";
import { extendConfig } from "@qwik.dev/router/vite";
import baseConfig from "../../vite.config.ts";

export default extendConfig(baseConfig, () => ({
  build: {
    ssr: true,
    rolldownOptions: { input: ["src/entry.node-server.tsx"] },
  },
  // No SSG: every page sits behind the auth guard and reads runtime env (API_URL), so prerendering has nothing to bake.
  plugins: [nodeServerAdapter({ name: "node-server", ssg: null })],
}));
