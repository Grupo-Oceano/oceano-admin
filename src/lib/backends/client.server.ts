import type { ApiError, Result } from "./types";

type Query = Record<string, string | number | boolean | null | undefined>;

export type BackendOptions = {
  /** Absolute base URL, e.g. `ev.env.get('API_URL')`. Empty = not configured (every call returns 503). */
  baseUrl: string | undefined;
  /** Env var that holds `baseUrl`, for the "not configured" message. */
  envName: string;
  /** Sent on every call (auth, tracing). */
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export type Backend = ReturnType<typeof createBackend>;

const join = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

const withQuery = (path: string, query?: Query) => {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "")
      params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}${path.includes("?") ? "&" : "?"}${qs}` : path;
};

/** Nest errors carry `message` as a string or a list of validation messages. */
const messageOf = (body: unknown): string | undefined => {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" ? message : undefined;
};

const parse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * A server-side client for one backend: native `fetch`, JSON in and out, `Result<T>` tuples.
 * Import it only from loaders, actions, endpoints and middleware (it is a `*.server.ts` module).
 */
export function createBackend({
  baseUrl,
  envName,
  headers = {},
  timeoutMs = 10_000,
}: BackendOptions) {
  const notConfigured: ApiError = {
    status: 503,
    message: `${envName} is not configured`,
  };

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Result<T>> {
    if (!baseUrl) return [notConfigured, null];
    try {
      const res = await fetch(join(baseUrl, path), {
        method,
        headers: {
          accept: "application/json",
          ...(body === undefined ? {} : { "content-type": "application/json" }),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await res.text();
      const json = text ? parse(text) : null;
      if (!res.ok) {
        return [
          {
            status: res.status,
            message:
              messageOf(json) ?? (res.statusText || `HTTP ${res.status}`),
          },
          null,
        ];
      }
      return [null, json as T];
    } catch (error) {
      return [
        {
          status: 502,
          message:
            error instanceof Error ? error.message : "Backend unreachable",
        },
        null,
      ];
    }
  }

  return {
    get: <T>(path: string, query?: Query) =>
      request<T>("GET", withQuery(path, query)),
    post: <T>(path: string, body?: unknown) =>
      request<T>("POST", path, body ?? {}),
    put: <T>(path: string, body?: unknown) =>
      request<T>("PUT", path, body ?? {}),
    patch: <T>(path: string, body?: unknown) =>
      request<T>("PATCH", path, body ?? {}),
    delete: <T>(path: string) => request<T>("DELETE", path),
    /** The raw `Response`, for streaming files through an endpoint. Throws when unreachable or unconfigured. */
    raw: (path: string, init: RequestInit = {}) => {
      if (!baseUrl) throw new Error(notConfigured.message);
      return fetch(join(baseUrl, path), {
        ...init,
        headers: { ...headers, ...(init.headers as Record<string, string>) },
      });
    },
  };
}
