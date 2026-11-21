import type { ApiError } from "~/lib/backends/types";
import { errorMessage } from "~/lib/crud/errors";

/** oceano-core access error codes (`access.errors.ts`) as sentences. */
export const ACCESS_ERROR_CODES: Record<string, string> = {
  cannot_disable_self: "You can't disable your own account.",
  cannot_demote_self: "You can't remove your own owner role.",
  last_owner: "There must always be at least one owner.",
  staff_exists: "Someone with that email is already in the staff list.",
  email_domain_not_allowed:
    "Only work email addresses (@gooceano.com) can be staff.",
  invalid_role: "That role doesn't exist for this site.",
  staff_not_found: "That staff member no longer exists.",
  site_not_found: "That site doesn't exist.",
  grant_not_found: "That person no longer has access to this site.",
  owner_only: "Only owners can manage access.",
  identity_conflict: "That email is linked to a different Microsoft account.",
  not_enabled: "Your account isn't enabled.",
  disabled: "Your account is disabled.",
  missing_token: "Your session expired. Reload the page to sign in again.",
  invalid_token: "Your session expired. Reload the page to sign in again.",
  staff_auth_unconfigured: "oceano-core isn't set up for staff sign-in yet.",
};

export const accessErrorMessage = (error: ApiError): string =>
  errorMessage(error, {
    codes: ACCESS_ERROR_CODES,
    status: { 400: "Some values weren't accepted. Check them and try again." },
    fallback: "The change wasn't saved. Try again.",
  });
