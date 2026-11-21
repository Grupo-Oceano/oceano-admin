import type { RequestHandler } from "@qwik.dev/router";
import { AUTH_COOKIE } from "~/lib/auth/cookies";
import { clearAuthCache } from "~/lib/auth/guard.server";

export const onPost: RequestHandler = async ({ cookie, redirect }) => {
  const token = cookie.get(AUTH_COOKIE)?.value;
  if (token) clearAuthCache(token);
  cookie.delete(AUTH_COOKIE, { path: "/" });
  throw redirect(302, "/login");
};
