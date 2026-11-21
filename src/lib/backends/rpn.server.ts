import type { RequestEventBase } from "@qwik.dev/router";
import { createBackend, type Backend } from "./client.server";
import { dropSiteToken, getSiteToken } from "./site-token.server";
import type { Result } from "./types";

type SiteEvent = Pick<RequestEventBase, "env" | "sharedMap">;

const SITE = "rpn";

/**
 * The RockyPoint.net API (`RPN_API_URL`, including `/api/v1`), called with a core site token (`aud site:rpn`).
 * A 401 (token revoked or rotated) drops the cached token and retries once with a fresh one.
 * ```ts
 * const result = await rpnCall(ev, (api) => api.get<ReviewQueuePage>('/admin/review-queue', query));
 * ```
 */
export async function rpnCall<T>(
  ev: SiteEvent,
  call: (api: Backend) => Promise<Result<T>>,
): Promise<Result<T>> {
  const client = (token: string) =>
    createBackend({
      baseUrl: ev.env.get("RPN_API_URL"),
      envName: "RPN_API_URL",
      headers: { authorization: `Bearer ${token}` },
    });

  const [tokenError, token] = await getSiteToken(ev, SITE);
  if (tokenError) return [tokenError, null];
  const result = await call(client(token.token));
  if (result[0]?.status !== 401) return result;

  dropSiteToken(ev, SITE);
  const [retryError, fresh] = await getSiteToken(ev, SITE);
  if (retryError) return [retryError, null];
  return call(client(fresh.token));
}
