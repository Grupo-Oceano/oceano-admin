import type { CookieOptions } from "@qwik.dev/router";

/** The legacy session cookie: the oceano-core JWT from `/auth/login` (24 h). Never readable from JS. */
export const AUTH_COOKIE = "auth";

export const authCookieOptions = (url: URL): CookieOptions => ({
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: url.protocol === "https:",
  maxAge: [24, "hours"],
});
