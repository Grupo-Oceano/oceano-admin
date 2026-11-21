import type { RequestHandler } from "@qwik.dev/router";
import { publicOrigin, readAuthConfig, signedOutUri } from "~/lib/auth/config";
import { forgetToken } from "~/lib/auth/guard.server";
import { entraLogoutUrl } from "~/lib/auth/msal.server";
import { clearSession, readSession } from "~/lib/auth/session.server";

/**
 * POST (a plain form in the user menu): clears the session cookie and what the server cached for it, then
 * signs out of Entra too, which comes back to `/auth/signed-out`.
 */
export const onPost: RequestHandler = async (ev) => {
  const get = (name: string) => ev.env.get(name);
  const config = readAuthConfig(get);
  if (config) {
    const session = await readSession(ev.cookie, config.sessionSecret);
    if (session) forgetToken(session.accessToken);
  }
  clearSession(ev.cookie);
  ev.headers.set("Cache-Control", "no-store");
  if (!config) throw ev.redirect(303, "/auth/signed-out/");
  throw ev.redirect(303, entraLogoutUrl(config, signedOutUri(publicOrigin(get, ev.url))));
};
