import type { ApiError } from "~/lib/backends/types";
import { errorMessage } from "~/lib/crud/errors";
import { OWNER_CONTACT } from "~/lib/auth/sign-in-errors";

/**
 * RockyPoint.net API (and site-token) errors as sentences. Codes come from rockypoint-net
 * `apps/api/src/admin/*.service.ts` and `staff-auth/staff.guard.ts`, and from oceano-core's site-token
 * endpoint (`no_site_access`, `site_tokens_unconfigured`).
 */
export const RPN_ERROR_CODES: Record<string, string> = {
  already_reviewed:
    "This request was already decided, so the decision wasn't changed. Reload to see the current state.",
  listing_not_in_review: "This listing is no longer waiting for review.",
  strategy_required:
    "Choose how this listing will be managed before approving it.",
  status_request_not_found: "This request no longer exists.",
  escapia_unit_taken:
    "That Escapia unit id is already linked to another property.",
  claimed_by_other: "Someone else claimed this property first.",
  not_pending_escapia: "This property is no longer waiting for Escapia keying.",
  not_in_escapia_queue: "This property is not in the Escapia keying queue.",
  property_not_found: "This property no longer exists.",
  no_site_access: `You don't have access to RockyPoint.net. Ask an owner (${OWNER_CONTACT}).`,
  staff_email_conflict:
    "RockyPoint.net already has a staff record for your email under another Microsoft account.",
  site_tokens_unconfigured:
    "oceano-core can't issue site tokens yet (signing key not configured).",
  staff_auth_unconfigured:
    "The RockyPoint.net API isn't set up to accept Oceano Admin sign-ins yet.",
  missing_token: "RockyPoint.net didn't receive your sign-in. Reload the page.",
  invalid_token:
    "RockyPoint.net rejected the Oceano Admin token. Its sign-in setup may be incomplete.",
  "RPN_API_URL is not configured":
    "RockyPoint.net's API address (RPN_API_URL) is not configured.",
};

export const rpnErrorMessage = (error: ApiError): string =>
  errorMessage(error, {
    codes: RPN_ERROR_CODES,
    status: {
      400: "Some values weren't accepted. Check them and try again.",
      401: "RockyPoint.net rejected the Oceano Admin token. Its sign-in setup may be incomplete.",
      403: `Your RockyPoint.net role doesn't allow this. Ask an owner (${OWNER_CONTACT}).`,
      409: "This changed in the meantime. Reload and try again.",
      503: "RockyPoint.net is unavailable right now. Try again in a moment.",
    },
    fallback: "RockyPoint.net didn't accept the change. Try again.",
  });
