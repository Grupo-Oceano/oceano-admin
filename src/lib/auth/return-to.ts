/** Where sign-in lands when `returnTo` is missing or rejected: the sites home. */
export const DEFAULT_RETURN_TO = "/";

const MAX_LENGTH = 512;
/**
 * A same-origin path of plain URL segments, an optional trailing slash and an optional query. `//host`,
 * `/\host`, encoded-slash tricks, fragments and control characters never pass.
 */
const SAFE_PATH = /^(?:\/[A-Za-z0-9._~-]+)*\/?(?:\?[^#\s\\]*)?$/;

/** Router-internal query params that must not survive into a return URL. */
const INTERNAL_PARAMS = ["qaction", "qloaders", "qfunc", "qdata"];

/**
 * Sign-in redirects only to this app's own pages (no open redirect). The value must be a RELATIVE path;
 * anything absolute, protocol-relative, backslashed, dot-segmented, or under `/auth/` (which would loop)
 * falls back to `/`. Ported from rockypoint-net `return-to.ts`, widened from `/manage/admin` to the whole app.
 */
export function sanitizeReturnTo(raw: string | null | undefined): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_LENGTH)
    return DEFAULT_RETURN_TO;
  if (!raw.startsWith("/") || raw.startsWith("//")) return DEFAULT_RETURN_TO;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return DEFAULT_RETURN_TO;
  if (!SAFE_PATH.test(raw)) return DEFAULT_RETURN_TO;
  const path = raw.split("?")[0];
  if (path === "/auth" || path.startsWith("/auth/")) return DEFAULT_RETURN_TO;
  // Belt and braces: resolved against a dummy origin it must stay there, and the path must not move
  // (dot segments like `/sites/../auth`).
  try {
    const url = new URL(raw, "https://admin.invalid");
    if (url.origin !== "https://admin.invalid") return DEFAULT_RETURN_TO;
    if (url.pathname !== path) return DEFAULT_RETURN_TO;
  } catch {
    return DEFAULT_RETURN_TO;
  }
  return raw;
}

/** The current page as a return path, without the router's internal params. */
export function returnPathOf(url: URL): string {
  const params = new URLSearchParams(url.search);
  for (const key of INTERNAL_PARAMS) params.delete(key);
  const qs = params.toString();
  return sanitizeReturnTo(`${url.pathname}${qs ? `?${qs}` : ""}`);
}

/** `/auth/login/?returnTo=…` with a sanitized target. */
export const loginUrl = (returnTo: string): string =>
  `/auth/login/?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`;
