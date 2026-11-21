/** Reasons the sign-in page explains (`/auth/sign-in/?error=…`). */
export const SIGN_IN_ERRORS = {
  entra:
    "Microsoft didn't complete the sign-in. Your account may not be allowed to use this app.",
  expired:
    "The sign-in took too long or was opened in another tab. Please try again.",
  state:
    "The sign-in response didn't match this browser, so it was ignored. Please try again.",
  exchange: "We couldn't finish signing you in with Microsoft. Please try again.",
  session:
    "We couldn't keep your session in this browser. Tell an administrator.",
  rejected:
    "oceano-core did not accept your sign-in. This usually means the setup is incomplete (audience or scope). If it keeps happening, tell an administrator.",
  unavailable:
    "The access service (oceano-core) is not responding, so we can't check your access right now. Try again in a moment.",
} as const;

export type SignInError = keyof typeof SIGN_IN_ERRORS;

export const signInErrorOf = (raw: string | null): SignInError | null =>
  raw && Object.hasOwn(SIGN_IN_ERRORS, raw) ? (raw as SignInError) : null;

/** Why oceano-core refused a verified Entra user (`/auth/not-enabled/?reason=…`). */
export const NOT_ENABLED_REASONS = {
  not_enabled:
    "Your Microsoft account signed in, but it isn't enabled for Oceano Admin yet, or it has no site assigned.",
  disabled: "Your Oceano Admin account has been disabled.",
  identity_conflict:
    "Your email is already linked to a different Microsoft account in Oceano Admin.",
} as const;

export type NotEnabledReason = keyof typeof NOT_ENABLED_REASONS;

export const notEnabledReasonOf = (raw: string | null | undefined) =>
  raw && Object.hasOwn(NOT_ENABLED_REASONS, raw)
    ? (raw as NotEnabledReason)
    : null;

/** Who to ask for access. */
export const OWNER_CONTACT = "chuck@gooceano.com";
