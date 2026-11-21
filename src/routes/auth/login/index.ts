import { CryptoProvider, ResponseMode } from "@azure/msal-node";
import type { RequestHandler } from "@qwik.dev/router";
import { randomBytes } from "node:crypto";
import {
  entraRedirectUri,
  isSecureOrigin,
  publicOrigin,
  readAuthConfig,
} from "~/lib/auth/config";
import { createEntraClient, entraScopes } from "~/lib/auth/msal.server";
import { sanitizeReturnTo } from "~/lib/auth/return-to";
import { writeLoginTransaction } from "~/lib/auth/session.server";

/**
 * Starts staff sign-in: authorization code flow with PKCE against the gooceano tenant. State, nonce and the
 * PKCE verifier go into a short-lived encrypted cookie only the callback reads. `returnTo` is restricted to
 * this app's own pages (no open redirect). Unconfigured → the sign-in page explains it.
 */
export const onGet: RequestHandler = async (ev) => {
  const get = (name: string) => ev.env.get(name);
  const config = readAuthConfig(get);
  if (!config) throw ev.redirect(302, "/auth/sign-in/");

  const origin = publicOrigin(get, ev.url);
  const returnTo = sanitizeReturnTo(ev.query.get("returnTo"));
  const { verifier, challenge } = await new CryptoProvider().generatePkceCodes();
  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");

  let authUrl: string;
  try {
    authUrl = await createEntraClient(config).getAuthCodeUrl({
      scopes: entraScopes(config),
      redirectUri: entraRedirectUri(origin),
      responseMode: ResponseMode.QUERY,
      codeChallenge: challenge,
      codeChallengeMethod: "S256",
      state,
      nonce,
    });
  } catch (error) {
    console.error("[auth] could not build the Entra sign-in URL:", (error as Error).message);
    throw ev.redirect(302, "/auth/sign-in/?error=entra");
  }

  await writeLoginTransaction(
    ev.cookie,
    { state, nonce, codeVerifier: verifier, returnTo },
    config.sessionSecret,
    isSecureOrigin(origin),
  );
  ev.headers.set("Cache-Control", "no-store");
  throw ev.redirect(302, authUrl);
};
