import type { Cookie, CookieOptions } from "@qwik.dev/router";
import { LOGIN_COOKIE, LOGIN_COOKIE_PATH, SESSION_COOKIE } from "./config";
import {
  chunkName,
  joinChunks,
  MAX_COOKIE_CHUNKS,
  seal,
  splitIntoChunks,
  unseal,
} from "./seal";

/** What the session cookie holds. No refresh token: on expiry, sign in again (silent while Entra's lives). */
export type EntraSession = {
  v: 1;
  /** Entra access token for ENTRA_API_SCOPE, sent to oceano-core as the Bearer. */
  accessToken: string;
  /** Session expiry (token expiry minus a skew), seconds since epoch. */
  exp: number;
  /** When this session was created, seconds since epoch. */
  iat: number;
  name: string;
  email: string;
  oid: string;
};

/** In-flight sign-in: everything the callback must check. */
export type LoginTransaction = {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
  exp: number;
};

/** Sessions end this long before the token does, so a backend never sees a token expire mid-request. */
const EXPIRY_SKEW_SECONDS = 60;
export const LOGIN_TTL_SECONDS = 600;
/** A token oceano-core rejects within this long of sign-in is a setup problem, not an expiry. */
const FRESH_SESSION_SECONDS = 120;

const now = () => Math.floor(Date.now() / 1000);

const base = (secure: boolean): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure,
});

export async function writeSession(
  cookie: Cookie,
  session: EntraSession,
  secret: string,
  secure: boolean,
): Promise<void> {
  const exp = session.exp - EXPIRY_SKEW_SECONDS;
  const maxAge = Math.max(exp - now(), 0);
  const chunks = splitIntoChunks(
    await seal({ ...session, exp }, secret, "admin-session"),
  );
  for (let i = 0; i < MAX_COOKIE_CHUNKS; i++) {
    const name = chunkName(SESSION_COOKIE, i);
    // A shorter session than the previous one must not leave a stale tail chunk.
    if (i < chunks.length)
      cookie.set(name, chunks[i], { ...base(secure), path: "/", maxAge });
    else if (cookie.has(name)) cookie.delete(name, { path: "/" });
  }
}

export function clearSession(cookie: Cookie): void {
  for (let i = 0; i < MAX_COOKIE_CHUNKS; i++) {
    cookie.delete(chunkName(SESSION_COOKIE, i), { path: "/" });
  }
}

/** The session, or `null` when missing, tampered with or expired. */
export async function readSession(
  cookie: Cookie,
  secret: string,
): Promise<EntraSession | null> {
  const sealed = joinChunks(SESSION_COOKIE, (name) => cookie.get(name)?.value);
  const session = await unseal<EntraSession>(sealed, secret, "admin-session");
  return session?.v === 1 ? session : null;
}

export const isFreshSession = (session: EntraSession): boolean =>
  now() - session.iat < FRESH_SESSION_SECONDS;

export async function writeLoginTransaction(
  cookie: Cookie,
  tx: Omit<LoginTransaction, "exp">,
  secret: string,
  secure: boolean,
): Promise<void> {
  const sealed = await seal(
    { ...tx, exp: now() + LOGIN_TTL_SECONDS },
    secret,
    "admin-login",
  );
  cookie.set(LOGIN_COOKIE, sealed, {
    ...base(secure),
    path: LOGIN_COOKIE_PATH,
    maxAge: LOGIN_TTL_SECONDS,
  });
}

/** Single use: the cookie is deleted, so a replayed callback finds no transaction. */
export async function takeLoginTransaction(
  cookie: Cookie,
  secret: string,
): Promise<LoginTransaction | null> {
  const tx = await unseal<LoginTransaction>(
    cookie.get(LOGIN_COOKIE)?.value,
    secret,
    "admin-login",
  );
  cookie.delete(LOGIN_COOKIE, { path: LOGIN_COOKIE_PATH });
  return tx;
}
