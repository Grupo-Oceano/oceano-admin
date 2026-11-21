import { z } from "@qwik.dev/router";
import type { ReviewSubject } from "./contract";

/**
 * `status_requests.snapshot` is `unknown` on the wire (a company profile or a PropertyIntakePayloadV1, both
 * `schemaVersion: 1`). These are DISPLAY schemas: the fields the detail page lays out, from rockypoint-net
 * `onboarding/company-profile.ts` and `intake/steps.ts` + `submit.ts`, without the write-side rules (the RPN
 * API validated the submission). Anything that doesn't parse is shown as raw JSON, so a reviewer always sees
 * what was submitted. Pure: unit-tested.
 */
const text = z.string();
const optionalText = z.string().nullish();

export const companySnapshot = z.object({
  schemaVersion: z.literal(1),
  companyName: text,
  legalName: optionalText,
  contactEmail: text,
  contactPhone: optionalText,
  website: optionalText,
  taxId: optionalText,
});
export type CompanySnapshot = z.infer<typeof companySnapshot>;

const time = z.string();

export const propertySnapshot = z.object({
  schemaVersion: z.literal(1),
  name: text,
  description: text,
  contentLocale: z.string(),
  address: z.object({
    street: text,
    neighborhood: optionalText,
    city: text,
    state: text,
    postalCode: text,
  }),
  geo: z.object({ lat: z.number(), lng: z.number() }),
  areaId: optionalText,
  escapiaLocationId: optionalText,
  bedrooms: z.number(),
  bathrooms: z.number(),
  maxOccupancy: z.number(),
  beds: z.array(z.object({ type: z.string(), count: z.number() })).nullish(),
  escapiaUnitTypeId: optionalText,
  amenityCodes: z.array(z.string()),
  houseRules: z.object({
    checkInTime: time,
    checkOutTime: time,
    minNights: z.number().nullish(),
    petsAllowed: z.boolean(),
    smokingAllowed: z.boolean(),
    eventsAllowed: z.boolean(),
    quietHours: z.object({ from: time, to: time }).nullish(),
    notes: optionalText,
  }),
  contact: z.object({
    phone: optionalText,
    whatsapp: optionalText,
    email: optionalText,
  }),
  requestedStrategy: z.string(),
  priceFromCents: z.number().int().nullish(),
  priceCurrency: z.string().nullish(),
  images: z.array(z.object({ id: z.string() }).passthrough()),
  ownershipAttested: z.boolean(),
});
export type PropertySnapshot = z.infer<typeof propertySnapshot>;

export type SnapshotView =
  | { kind: "company"; data: CompanySnapshot }
  | { kind: "property"; data: PropertySnapshot }
  | { kind: "raw"; json: string };

const raw = (snapshot: unknown): SnapshotView => ({
  kind: "raw",
  json: JSON.stringify(snapshot ?? null, null, 2),
});

export function describeSnapshot(
  subject: ReviewSubject,
  snapshot: unknown,
): SnapshotView {
  if (typeof snapshot !== "object" || snapshot === null) return raw(snapshot);
  if ((snapshot as { schemaVersion?: unknown }).schemaVersion !== 1)
    return raw(snapshot);
  const parsed =
    subject === "partner"
      ? companySnapshot.safeParse(snapshot)
      : propertySnapshot.safeParse(snapshot);
  if (!parsed.success) return raw(snapshot);
  return subject === "partner"
    ? { kind: "company", data: parsed.data as CompanySnapshot }
    : { kind: "property", data: parsed.data as PropertySnapshot };
}

/** "$1,250.00"-style price from integer cents. */
export const formatPriceFrom = (cents: number, currency: string): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

/** The partner's requested strategy, to preselect it on approve. */
export const requestedStrategyOf = (snapshot: unknown): string | undefined => {
  const value =
    typeof snapshot === "object" && snapshot !== null
      ? (snapshot as Record<string, unknown>).requestedStrategy
      : undefined;
  return value === "self_managed" || value === "oceano_managed"
    ? value
    : undefined;
};
