import type { ApiError } from "../backends/types";

/** Readable messages per backend error code (`{ message: "<code>" }`), and per status as a fallback. */
export type ErrorMessages = {
  codes?: Record<string, string>;
  status?: Partial<Record<number, string>>;
  fallback: string;
};

/** Generic messages shared by every backend. */
const COMMON_STATUS: Record<number, string> = {
  401: "Your session expired. Reload the page to sign in again.",
  403: "You don't have access to do this.",
  404: "This item no longer exists.",
  502: "The service isn't responding. Try again in a moment.",
  503: "The service is unavailable right now. Try again in a moment.",
  504: "The service took too long to answer. Try again.",
};

/**
 * A backend error as a sentence for a toast or an inline alert: the code's message, else the status's,
 * else the fallback. Pure: unit-tested.
 */
export function errorMessage(error: ApiError, messages: ErrorMessages): string {
  const code = error.message?.trim();
  if (code && messages.codes && Object.hasOwn(messages.codes, code))
    return messages.codes[code];
  const byStatus =
    messages.status?.[error.status] ?? COMMON_STATUS[error.status];
  if (byStatus) return byStatus;
  if (error.status >= 500) return COMMON_STATUS[503];
  return messages.fallback;
}
