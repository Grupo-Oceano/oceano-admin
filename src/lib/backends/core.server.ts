import type { RequestEventBase } from "@qwik.dev/router";
import { AUTH_COOKIE } from "../auth/cookies";
import { createBackend } from "./client.server";

/**
 * oceano-core (`API_URL`, e.g. http://oceano-backbone:3000 inside the stack). One client per request.
 * Today it forwards the `auth` cookie as a Bearer token (the legacy username/password session); with Entra
 * it will send the session's Entra access token instead (docs/architecture/multi-site-admin.md).
 */
export const coreApi = (ev: Pick<RequestEventBase, "env" | "cookie">) => {
  const token = ev.cookie.get(AUTH_COOKIE)?.value;
  return createBackend({
    baseUrl: ev.env.get("API_URL"),
    envName: "API_URL",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
};
