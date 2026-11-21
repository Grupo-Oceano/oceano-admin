import type {
  EscapiaKeyingSectionId,
  ListingLifecycleState,
  PartnerOnboardingState,
  PropertyStrategy,
  ReviewQueueFilter,
  ReviewSubject,
  StatusRequestStatus,
} from "./contract";

/**
 * UI copy for the RockyPoint.net module, English only (the RPN web panel was en/es; staff here read
 * English). Taken from rockypoint-net `apps/web/messages/en.json` › `manage.admin`.
 */
export const QUEUE_TABS: Record<ReviewQueueFilter, string> = {
  open: "Open",
  approved: "Approved",
  rejected: "Rejected",
};

export const SUBJECT_FILTERS: Record<"" | ReviewSubject, string> = {
  "": "All",
  partner: "Companies",
  listing: "Listings",
};

export const SUBJECT_LABEL: Record<ReviewSubject, string> = {
  partner: "Company",
  listing: "Listing",
};

export const SUBJECT_KICKER: Record<ReviewSubject, string> = {
  partner: "Company profile",
  listing: "Listing",
};

export const REQUEST_STATUS: Record<StatusRequestStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

export const PARTNER_STATES: Record<PartnerOnboardingState, string> = {
  no_partner: "No company",
  profile_incomplete: "Profile incomplete",
  in_review: "In review",
  rejected: "Rejected",
  approved: "Approved",
  archived: "Archived",
};

export const LISTING_STATES: Record<ListingLifecycleState, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  rejected: "Rejected",
  pending_escapia_onboarding: "Approved, waiting for Escapia keying",
  live_self_managed: "Live (self-managed)",
  live_oceano_managed: "Live (Oceano-managed)",
  archived: "Archived",
};

export const STRATEGIES: Record<PropertyStrategy, string> = {
  self_managed: "Self-managed (partner handles bookings)",
  oceano_managed: "Managed by Oceano (keyed into Escapia)",
};

export const ESCAPIA_SECTIONS: Record<EscapiaKeyingSectionId, string> = {
  unit: "Unit",
  address: "Address",
  rooms: "Rooms",
  descriptions: "Descriptions",
  amenities: "Amenities",
  policies: "Policies",
  photos: "Photos",
  contact: "Contact",
};

export const ASSIGNEE_FILTERS: Record<"" | "unassigned" | "me", string> = {
  "": "All pending",
  unassigned: "Unclaimed",
  me: "Claimed by me",
};

/** A label for any known enum value, or the raw value when the API sends a newer one. */
export const labelOf = <K extends string>(
  table: Record<K, string>,
  value: string | null | undefined,
): string =>
  value && Object.hasOwn(table, value) ? table[value as K] : (value ?? "");

/** `checkInTime` → "Check in time": readable fallback for keying field keys. */
export const humanizeKey = (key: string): string => {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .trim()
    .toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : key;
};

/** "Approved" → tone for a Badge. */
export const requestTone = (status: string) =>
  status === "approved" ? "success" : status === "rejected" ? "danger" : "warning";
