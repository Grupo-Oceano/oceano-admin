import type { RequestEventCommon } from "@qwik.dev/router";
import type { Result } from "./types";

type Redirecting = Pick<RequestEventCommon, "redirect">;

/**
 * For loaders that render the failure in place (tables, panels): a 401 sends the user to /login, any other
 * error comes back as data, so the page keeps its layout and shows the message.
 * ```ts
 * const { data, error } = loaderResult(ev, await coreApi(ev).get<ApiResponse<Backup[]>>('/oceano-infra/list-backups'));
 * ```
 */
export function loaderResult<T>(
  ev: Redirecting,
  [error, data]: Result<T>,
): { data: T | null; error: string | null } {
  if (error?.status === 401) throw ev.redirect(302, "/login");
  return error ? { data: null, error: error.message } : { data, error: null };
}
