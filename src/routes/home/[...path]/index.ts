import type { RequestHandler } from "@qwik.dev/router";

/** The modules lived under `/home/*` before the Entra shell; keep old bookmarks working. */
export const onGet: RequestHandler = async (ev) => {
  const rest = (ev.params.path ?? "").replace(/^\/+|\/+$/g, "");
  const safe = /^[A-Za-z0-9/_-]*$/.test(rest) && !rest.includes("//") ? rest : "";
  throw ev.redirect(301, safe ? `/${safe}/${ev.url.search}` : "/");
};
