import type { RequestEventBase } from "@qwik.dev/router";
import { SESSION, type SessionView } from "../auth/session";
import { coreApi } from "./core.server";
import { SiteTokenCache, type SiteToken } from "./site-token-cache";
import type { ApiResponse, Result } from "./types";

type SiteEvent = Pick<RequestEventBase, "env" | "sharedMap">;

/** One cache per server process. */
export const siteTokens = new SiteTokenCache();

/**
 * A site token for the signed-in staff member (`POST <core>/admin/site-tokens { site }`), cached until 60 s
 * before it expires. A site that isn't in the session's `sites` fails here with 403 `no_site_access`, without
 * asking oceano-core (which would refuse it too).
 */
export async function getSiteToken(
  ev: SiteEvent,
  site: string,
): Promise<Result<SiteToken>> {
  const session = ev.sharedMap.get(SESSION) as SessionView | undefined;
  if (!session) return [{ status: 401, message: "missing_token" }, null];
  if (!session.sites.some((s) => s.key === site))
    return [{ status: 403, message: "no_site_access" }, null];

  const staffId = session.staff.id;
  const cached = siteTokens.get(staffId, site);
  if (cached) return [null, cached];

  return siteTokens.shared(staffId, site, async (): Promise<Result<SiteToken>> => {
    const [error, res] = await coreApi(ev).post<ApiResponse<SiteToken>>(
      "/admin/site-tokens",
      { site },
    );
    if (error) return [error, null];
    if (!res?.data?.token) return [{ status: 502, message: "bad_site_token" }, null];
    siteTokens.set(staffId, site, res.data);
    return [null, res.data];
  });
}

/** Drops a token a site API rejected (401), so the next call gets a fresh one. */
export function dropSiteToken(ev: SiteEvent, site: string): void {
  const session = ev.sharedMap.get(SESSION) as SessionView | undefined;
  if (session) siteTokens.delete(session.staff.id, site);
}
