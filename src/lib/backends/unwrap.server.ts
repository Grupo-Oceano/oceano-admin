import type { RequestEventCommon } from "@qwik.dev/router";
import { loginUrl, returnPathOf } from "../auth/return-to";
import type { ApiError, Result } from "./types";

type Redirecting = Pick<RequestEventCommon, "redirect" | "url">;

/**
 * For loaders that render the failure in place (tables, panels). oceano-core answering 401 means the Entra
 * token expired since the guard checked it: sign in again (silent) and come back. Any other error comes back
 * as data, mapped to a readable message by `message` (default: the backend's own), so the page keeps its
 * layout. Site APIs pass `signInOn401: false`: their 401 is a setup problem, and re-signing would loop.
 * ```ts
 * const { data, error } = loaderResult(ev, await coreApi(ev).get<ApiResponse<Backup[]>>('/oceano-infra/list-backups'));
 * ```
 */
export function loaderResult<T>(
  ev: Redirecting,
  [error, data]: Result<T>,
  options: {
    message?: (error: ApiError) => string;
    signInOn401?: boolean;
  } = {},
): { data: T | null; error: string | null } {
  if (error?.status === 401 && options.signInOn401 !== false)
    throw ev.redirect(302, loginUrl(returnPathOf(ev.url)));
  if (error)
    return {
      data: null,
      error: options.message ? options.message(error) : error.message,
    };
  return { data, error: null };
}
