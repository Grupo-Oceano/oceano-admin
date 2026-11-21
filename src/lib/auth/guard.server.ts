import type { RequestEventBase, RequestHandler } from "@qwik.dev/router";
import { createHash } from "node:crypto";
import { coreApi } from "../backends/core.server";
import { siteTokens } from "../backends/site-token.server";
import type { ApiResponse, Result } from "../backends/types";
import { TtlCache } from "../ttl-cache";
import { readAuthConfig } from "./config";
import { ACCESS_DENIED, ACCESS_TOKEN } from "./keys";
import { loginUrl, returnPathOf } from "./return-to";
import { clearSession, isFreshSession, readSession } from "./session.server";
import { SESSION, type SessionView } from "./session";
import { notEnabledReasonOf } from "./sign-in-errors";

/** `GET /admin/me` results per token, for a few seconds: one page load runs the guard several times. */
const ME_CACHE_MS = 10_000;
const meCache = new TtlCache<SessionView>(500);

const tokenKey = (token: string) =>
  createHash("sha256").update(token).digest("base64url");

/** Forgets everything cached for a token (sign-out). */
export function forgetToken(token: string): void {
  const key = tokenKey(token);
  const me = meCache.get(key);
  if (me) siteTokens.delete(me.staff.id);
  meCache.delete(key);
}

async function loadMe(
  ev: Pick<RequestEventBase, "env" | "sharedMap">,
  token: string,
): Promise<Result<SessionView>> {
  const key = tokenKey(token);
  const cached = meCache.get(key);
  if (cached) return [null, cached];
  const [error, res] = await coreApi(ev, token).get<ApiResponse<SessionView>>(
    "/admin/me",
  );
  if (error) return [error, null];
  if (!res?.data?.staff) return [{ status: 502, message: "bad_me" }, null];
  const me = { staff: res.data.staff, sites: res.data.sites ?? [] };
  meCache.set(key, me, Date.now() + ME_CACHE_MS);
  return [null, me];
}

/**
 * `onRequest` of every signed-in layout (`routes/(app)/layout*.tsx`). Sign-in not configured → the sign-in
 * page explains it (never allows). No or expired session → Entra sign-in, back to this page. Then oceano-core
 * decides: `GET /admin/me` with the Entra Bearer → `{ staff, sites }` in `sharedMap[SESSION]` and the token in
 * `sharedMap[ACCESS_TOKEN]` (server only). 401 → sign in again (unless the session is brand new: then the
 * setup is wrong and another sign-in would loop); 403 not_enabled/disabled/identity_conflict → an explanation
 * page; anything else → "access service unavailable".
 */
export const requireStaff: RequestHandler = async (ev) => {
  ev.headers.set("Cache-Control", "private, no-store");
  const config = readAuthConfig((name) => ev.env.get(name));
  if (!config) throw ev.redirect(302, "/auth/sign-in/");

  const returnTo = returnPathOf(ev.url);
  const session = await readSession(ev.cookie, config.sessionSecret);
  if (!session) throw ev.redirect(302, loginUrl(returnTo));

  const [error, me] = await loadMe(ev, session.accessToken);
  if (error) {
    if (error.status === 401) {
      clearSession(ev.cookie);
      if (isFreshSession(session))
        throw ev.redirect(302, "/auth/sign-in/?error=rejected");
      throw ev.redirect(302, loginUrl(returnTo));
    }
    const reason = error.status === 403 ? notEnabledReasonOf(error.message) : null;
    if (reason) throw ev.redirect(302, `/auth/not-enabled/?reason=${reason}`);
    console.warn(`[auth] /admin/me failed: ${error.status} ${error.message}`);
    throw ev.redirect(
      302,
      `/auth/sign-in/?error=unavailable&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  ev.sharedMap.set(ACCESS_TOKEN, session.accessToken);
  ev.sharedMap.set(SESSION, me);
};

/** The session the guard resolved (every `(app)` route has one). */
export const sessionOf = (
  ev: Pick<RequestEventBase, "sharedMap">,
): SessionView | null =>
  (ev.sharedMap.get(SESSION) as SessionView | undefined) ?? null;

/** Why a section refuses the staff member; the section layout renders it in place of the page. */
export type AccessDenied = { reason: "owner_only" | "no_site_access"; site?: string };

const deny = (ev: Parameters<RequestHandler>[0], denied: AccessDenied) => {
  ev.sharedMap.set(ACCESS_DENIED, denied);
  // Document requests answer 403; the router's own JSON requests keep their status so SPA navigation works.
  if (!ev.internalRequest) ev.status(403);
};

/** For actions: owners only (the layout decided who sees the page, not who may write). */
export const isOwner = (ev: Pick<RequestEventBase, "sharedMap">): boolean =>
  !!sessionOf(ev)?.staff.isOwner;

/** `/access` layout: owners only. */
export const requireOwner: RequestHandler = async (ev) => {
  if (!sessionOf(ev)?.staff.isOwner) deny(ev, { reason: "owner_only" });
};

/** A site module's layout: staff with a grant on `site` (owners have every active site). */
export const requireSite =
  (site: string): RequestHandler =>
  async (ev) => {
    if (!siteRoleOf(ev, site)) deny(ev, { reason: "no_site_access", site });
  };

export const accessDeniedOf = (
  ev: Pick<RequestEventBase, "sharedMap">,
): AccessDenied | null =>
  (ev.sharedMap.get(ACCESS_DENIED) as AccessDenied | undefined) ?? null;

/** The staff member's role on `site` (`owner` for owners), or null. */
export const siteRoleOf = (
  ev: Pick<RequestEventBase, "sharedMap">,
  site: string,
): string | null =>
  sessionOf(ev)?.sites.find((s) => s.key === site)?.role ?? null;
