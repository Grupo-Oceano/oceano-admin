/**
 * Bundle entry point for `pnpm preview` (Vite preview of a production build).
 */
import { createQwikRouter } from "@qwik.dev/router/middleware/node";
import render from "./entry.ssr";

export default createQwikRouter({ render });
