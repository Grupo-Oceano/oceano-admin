import type { AuthenticationResult } from "@azure/msal-node";
import type { RequestHandler } from "@qwik.dev/router";
import { timingSafeEqual } from "node:crypto";
import {
  entraRedirectUri,
  isSecureOrigin,
  publicOrigin,
  readAuthConfig,
} from "~/lib/auth/config";
import { createEntraClient, entraScopes } from "~/lib/auth/msal.server";
import { sanitizeReturnTo } from "~/lib/auth/return-to";
import { takeLoginTransaction, writeSession } from "~/lib/auth/session.server";
import type { SignInError } from "~/lib/auth/sign-in-errors";

const sameString = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const claim = (
  claims: Record<string, unknown>,
  key: string,
): string | undefined =>
  typeof claims[key] === "string" ? (claims[key] as string) : undefined;

/**
 * Entra redirects here with `?code&state`. Verifies the state against the login cookie, redeems the code with
 * the PKCE verifier (MSAL also checks the id token's nonce), and stores the oceano-core access token in the
 * encrypted session cookie. Failures land on `/auth/sign-in/?error=…`, outside the guard, so a broken setup
 * can't bounce the browser in a loop.
 */
export const onGet: RequestHandler = async (ev) => {
  const get = (name: string) => ev.env.get(name);
  const config = readAuthConfig(get);
  if (!config) throw ev.redirect(302, "/auth/sign-in/");
  ev.headers.set("Cache-Control", "no-store");

  const origin = publicOrigin(get, ev.url);
  const tx = await takeLoginTransaction(ev.cookie, config.sessionSecret);
  const fail = (error: SignInError) =>
    ev.redirect(302, `/auth/sign-in/?error=${error}`);

  if (ev.query.get("error")) {
    // e.g. access_denied (user not assigned to the app) or consent_required.
    console.warn("[auth] Entra returned an error:", ev.query.get("error"));
    throw fail("entra");
  }
  if (!tx) throw fail("expired");

  const code = ev.query.get("code");
  const state = ev.query.get("state");
  if (!code || !state || !sameString(state, tx.state)) throw fail("state");

  let result: AuthenticationResult;
  try {
    result = await createEntraClient(config).acquireTokenByCode(
      {
        code,
        scopes: entraScopes(config),
        redirectUri: entraRedirectUri(origin),
        codeVerifier: tx.codeVerifier,
        nonce: tx.nonce,
        state: tx.state,
      },
      { code, state },
    );
  } catch (error) {
    console.warn("[auth] code redemption failed:", (error as Error).message);
    throw fail("exchange");
  }

  const claims = (result.idTokenClaims ?? {}) as Record<string, unknown>;
  const oid = claim(claims, "oid") ?? result.account?.localAccountId;
  if (!result.accessToken || !result.expiresOn || !oid) throw fail("exchange");

  try {
    await writeSession(
      ev.cookie,
      {
        v: 1,
        accessToken: result.accessToken,
        exp: Math.floor(result.expiresOn.getTime() / 1000),
        iat: Math.floor(Date.now() / 1000),
        name: result.account?.name ?? claim(claims, "name") ?? "",
        email:
          result.account?.username ?? claim(claims, "preferred_username") ?? "",
        oid,
      },
      config.sessionSecret,
      isSecureOrigin(origin),
    );
  } catch (error) {
    // Only an oversized token gets here (more than MAX_COOKIE_CHUNKS cookies).
    console.error(
      "[auth] could not store the session:",
      (error as Error).message,
    );
    throw fail("session");
  }

  throw ev.redirect(302, sanitizeReturnTo(tx.returnTo));
};
