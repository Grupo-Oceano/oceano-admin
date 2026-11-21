/**
 * Staff sign-in (Microsoft Entra, "Oceano Admin" registration) configuration. Setup: docs/setup/entra.md.
 * Every value is a runtime server env var (`ev.env.get`), never `import.meta.env`, so nothing here reaches a
 * client bundle. Ported from rockypoint-net `apps/web/src/lib/staff-auth/config.ts`.
 */

export type AuthConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  /** `api://<client-id>/access_as_user`: the scope oceano-core checks. */
  apiScope: string;
  /** Keys the encrypted cookies. 32+ random bytes. */
  sessionSecret: string;
};

/** The session secret must carry at least 256 bits; shorter is a misconfiguration. */
export const MIN_SESSION_SECRET_LENGTH = 32;

/** Reads one env var: `(name) => ev.env.get(name)`. */
export type EnvGet = (name: string) => string | undefined;

/** `null` when anything is missing or the secret is too short: sign-in is then "not configured", never open. */
export function readAuthConfig(get: EnvGet): AuthConfig | null {
  const tenantId = get("ENTRA_TENANT_ID")?.trim();
  const clientId = get("ENTRA_CLIENT_ID")?.trim();
  const clientSecret = get("ENTRA_CLIENT_SECRET")?.trim();
  const apiScope = get("ENTRA_API_SCOPE")?.trim();
  const sessionSecret = get("ADMIN_SESSION_SECRET")?.trim();
  if (!tenantId || !clientId || !clientSecret || !apiScope || !sessionSecret)
    return null;
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) return null;
  return { tenantId, clientId, clientSecret, apiScope, sessionSecret };
}

/**
 * The origin the browser uses, and the one registered in Entra. Behind nginx/Coolify the request URL can be
 * internal, so `PUBLIC_ORIGIN` wins; without it (local dev) the request's own origin is used. Read at request
 * time, so one image serves staging and production.
 */
export const publicOrigin = (get: EnvGet, requestUrl: URL): string =>
  (get("PUBLIC_ORIGIN")?.trim() || requestUrl.origin).replace(/\/+$/, "");

/** Cookies are `Secure` whenever the app is served over HTTPS. */
export const isSecureOrigin = (origin: string): boolean =>
  origin.startsWith("https://");

/** Encrypted session cookie (Entra access token + display fields), chunked as `oa_session`, `oa_session.1`, … */
export const SESSION_COOKIE = "oa_session";
/** Short-lived encrypted cookie with state, nonce, PKCE verifier and returnTo while signing in. */
export const LOGIN_COOKIE = "oa_login";
/** Only the callback needs the login cookie back. */
export const LOGIN_COOKIE_PATH = "/auth/callback";

/** Must match a Redirect URI on the app registration exactly. */
export const entraRedirectUri = (origin: string): string =>
  `${origin}/auth/callback`;
/** Entra's post-logout redirect: must be registered too. */
export const signedOutUri = (origin: string): string =>
  `${origin}/auth/signed-out`;
