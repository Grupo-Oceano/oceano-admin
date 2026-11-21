/**
 * Production HTTP server (`pnpm serve`), behind nginx (nginx.conf) on port 3000.
 * Set ORIGIN (e.g. https://admin.oceanorentals.net) so CSRF checks and cookies see the public URL.
 */
import { createQwikRouter } from "@qwik.dev/router/middleware/node";
import { createServer } from "node:http";
import render from "./entry.ssr";

const PORT = process.env.PORT ?? 3000;

const { router, staticFile } = createQwikRouter({
  render,
  static: { cacheControl: "public, max-age=31536000, immutable" },
  // why: v1 ran with the origin check off (nginx forwards Host but ORIGIN was never set); kept until ORIGIN is configured.
  checkOrigin: false,
});

const server = createServer();
server.on("request", (req, res) => {
  staticFile(req, res, () => {
    router(req, res, () => {
      res.statusCode = 404;
      res.end();
    });
  });
});
server.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
