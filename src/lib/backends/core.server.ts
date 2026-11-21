import type { RequestEventBase } from "@qwik.dev/router";
import { ACCESS_TOKEN } from "../auth/keys";
import { createBackend } from "./client.server";

type CoreEvent = Pick<RequestEventBase, "env" | "sharedMap">;

/**
 * oceano-core (`CORE_API_URL`, e.g. https://services.oceanorentals.net). One client per request. It sends the
 * signed-in staff member's Entra access token, which the `(app)` guard decrypted from the session cookie into
 * `sharedMap` (server memory only). `token` overrides it (the guard's own `/admin/me` call).
 */
export const coreApi = (ev: CoreEvent, token?: string) => {
  const bearer =
    token ?? (ev.sharedMap.get(ACCESS_TOKEN) as string | undefined);
  return createBackend({
    baseUrl: ev.env.get("CORE_API_URL"),
    envName: "CORE_API_URL",
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  });
};
