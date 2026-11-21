import type { RequestHandler } from "@qwik.dev/router";
import type { ApiResponse } from "../backends/types";
import { coreApi } from "../backends/core.server";
import { AUTH_COOKIE } from "./cookies";
import { SESSION_USER, type SessionUser } from "./session";

/** Valid tokens are re-checked against oceano-core at most every 5 minutes per server process. */
const CACHE_MS = 5 * 60 * 1000;
const authCache = new Map<string, { user: SessionUser | null; at: number }>();

export const clearAuthCache = (token?: string) =>
  token ? authCache.delete(token) : authCache.clear();

const isAuthPage = (path: string) =>
  path.startsWith("/login") || path.startsWith("/register");

async function userFor(
  token: string,
  ev: Parameters<RequestHandler>[0],
): Promise<SessionUser | null> {
  const cached = authCache.get(token);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.user;
  const [error, res] = await coreApi(ev).post<
    ApiResponse<{ username: string }>
  >("/auth/check-token", { token });
  const user =
    !error && res?.data?.username ? { username: res.data.username } : null;
  authCache.set(token, { user, at: Date.now() });
  return user;
}

/**
 * Root `onRequest`: the legacy username/password session (until Entra replaces it).
 * Signed in → `/` and `/login` go to `/home`, the user lands in `sharedMap`. Signed out → everything but
 * `/login` goes to `/login`.
 */
export const authGuard: RequestHandler = async (ev) => {
  const path = ev.url.pathname;
  const token = ev.cookie.get(AUTH_COOKIE)?.value;
  const user = token ? await userFor(token, ev) : null;

  if (user) {
    ev.sharedMap.set(SESSION_USER, user);
    ev.headers.set("Cache-Control", "private, no-store");
    if (path === "/" || isAuthPage(path)) throw ev.redirect(302, "/home");
    return;
  }
  if (isAuthPage(path)) return;
  throw ev.redirect(302, "/login");
};
