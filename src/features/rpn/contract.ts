import { z } from "@qwik.dev/router";

/**
 * The RockyPoint.net staff API (`/api/v1/admin/*`), copied from rockypoint-net
 * `packages/shared/src/review/api-contract.ts` and `escapia-contract.ts` (and the enums they import) as local
 * zod schemas. No cross-repo dependency on purpose: when the RPN contract changes, update this file.
 * Routes (apps/api/src/admin/admin-review.controller.ts, admin-escapia.controller.ts):
 *
 *   GET  /admin/review-queue                          → ReviewQueuePage
 *   GET  /admin/status-requests/:id                   → StatusRequestDetail
 *   POST /admin/status-requests/:id/approve           → StatusRequestDetail
 *   POST /admin/status-requests/:id/reject            → StatusRequestDetail
 *   GET  /admin/escapia-queue                         → EscapiaQueuePage
 *   GET  /admin/escapia-queue/:listingId              → EscapiaKeyingDetail
 *   POST /admin/properties/:listingId/claim           → EscapiaQueueItem
 *   POST /admin/properties/:listingId/unclaim         → EscapiaQueueItem
 *   POST /admin/properties/:listingId/link-escapia    → 202 EscapiaQueueItem
 */

export const STATUS_REQUEST_STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
] as const;
export type StatusRequestStatus = (typeof STATUS_REQUEST_STATUSES)[number];

export const REVIEW_SUBJECTS = ["partner", "listing"] as const;
export type ReviewSubject = (typeof REVIEW_SUBJECTS)[number];

/** `open` = pending | under_review, the review queue itself. */
export const REVIEW_QUEUE_FILTERS = ["open", "approved", "rejected"] as const;
export type ReviewQueueFilter = (typeof REVIEW_QUEUE_FILTERS)[number];

/** rockypoint-net `intake/steps.ts`. */
export const PROPERTY_STRATEGIES = ["self_managed", "oceano_managed"] as const;
export type PropertyStrategy = (typeof PROPERTY_STRATEGIES)[number];

/** rockypoint-net `intake/lifecycle.ts` (derived, never stored). */
export const LISTING_LIFECYCLE_STATES = [
  "draft",
  "pending_review",
  "rejected",
  "pending_escapia_onboarding",
  "live_self_managed",
  "live_oceano_managed",
  "archived",
] as const;
export type ListingLifecycleState = (typeof LISTING_LIFECYCLE_STATES)[number];

/** rockypoint-net `onboarding/partner-onboarding-state.ts` (derived, never stored). */
export const PARTNER_ONBOARDING_STATES = [
  "no_partner",
  "profile_incomplete",
  "in_review",
  "rejected",
  "approved",
  "archived",
] as const;
export type PartnerOnboardingState = (typeof PARTNER_ONBOARDING_STATES)[number];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (raw: string | undefined | null): raw is string =>
  !!raw && UUID.test(raw);

/** Notes the partner reads. Required on reject, optional on approve. */
const reviewNotes = z
  .string()
  .trim()
  .max(2000, "Notes can be at most 2000 characters.");

/** POST /admin/status-requests/:id/approve (+ the route id). */
export const approveRequestInput = z.object({
  id: z.string().regex(UUID),
  reviewNotes: reviewNotes.optional().transform((v) => (v ? v : undefined)),
  /** Listings only; defaults (API side) to the partner's requested strategy. Ignored for partners. */
  strategy: z
    .enum(PROPERTY_STRATEGIES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type ApproveRequestInput = z.infer<typeof approveRequestInput>;

/** POST /admin/status-requests/:id/reject (+ the route id). */
export const rejectRequestInput = z.object({
  id: z.string().regex(UUID),
  reviewNotes: reviewNotes.min(
    3,
    "Write at least 3 characters for the partner.",
  ),
});
export type RejectRequestInput = z.infer<typeof rejectRequestInput>;

/** An Escapia unit's native PMS id (job-id-safe alphabet: no ':'). */
export const ESCAPIA_UNIT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** POST /admin/properties/:listingId/link-escapia (+ the route id). */
export const linkEscapiaInput = z.object({
  listingId: z.string().regex(UUID),
  escapiaUnitId: z
    .string()
    .trim()
    .regex(
      ESCAPIA_UNIT_ID_PATTERN,
      "Use the unit id exactly as Escapia shows it: letters, digits, - and _ only (max 64).",
    ),
});

/** POST /admin/properties/:listingId/claim | unclaim */
export const listingIdInput = z.object({ listingId: z.string().regex(UUID) });

// ---- Response shapes (interfaces in the RPN shared package) ----

export type ReviewQueueItem = {
  id: string;
  subject: ReviewSubject;
  status: StatusRequestStatus;
  /** The subject's status before this request (e.g. 'draft', 'rejected'). */
  previousStatus: string | null;
  createdAt: string;
  reviewedAt: string | null;
  partner: { id: string; companyName: string };
  /** Set when subject = 'listing'. */
  listing: { id: string; name: string; type: string } | null;
};

export type ReviewQueuePage = {
  items: ReviewQueueItem[];
  nextCursor: string | null;
};

export type StatusRequestDetail = ReviewQueueItem & {
  reviewNotes: string | null;
  reviewer: { id: string; name: string; email: string } | null;
  /** The entity as submitted: a company profile, or a PropertyIntakePayloadV1. */
  snapshot: unknown;
  partnerState: PartnerOnboardingState;
  listingState: ListingLifecycleState | null;
};

export type EscapiaQueueStaff = { id: string; name: string; email: string };

export type EscapiaQueueItem = {
  listingId: string;
  name: string;
  slug: string;
  partner: { id: string; companyName: string };
  approvedAt: string | null;
  assignee: EscapiaQueueStaff | null;
  assignedAt: string | null;
  /** A pasted unit id still being verified; null when nothing is in flight. */
  escapiaUnitId: string | null;
  /** The last pasted unit id was NOT found in Escapia (cleared by the next link). */
  linkFailure: { escapiaUnitId: string; failedAt: string } | null;
  listingState: ListingLifecycleState;
};

export type EscapiaQueuePage = { items: EscapiaQueueItem[] };

export type EscapiaFieldValue = string | number | boolean | string[] | null;

export const ESCAPIA_KEYING_SECTIONS = [
  "unit",
  "address",
  "rooms",
  "descriptions",
  "amenities",
  "policies",
  "photos",
  "contact",
] as const;
export type EscapiaKeyingSectionId = (typeof ESCAPIA_KEYING_SECTIONS)[number];

export type EscapiaKeyingSection = {
  id: EscapiaKeyingSectionId;
  fields: { key: string; value: EscapiaFieldValue }[];
};

export type EscapiaKeyingDetail = EscapiaQueueItem & {
  intake: {
    id: string;
    submittedAt: string;
    sections: EscapiaKeyingSection[];
  } | null;
};
