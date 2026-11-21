import { z } from "@qwik.dev/router";
import { REVIEW_QUEUE_FILTERS, REVIEW_SUBJECTS } from "./contract";

/** Page size of the review queue (the API allows 1–100). */
export const REVIEW_PAGE_SIZE = 25;

const CURSOR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `/sites/rpn?status=&subject=&cursor=` (the URL is the state). Never throws: unknown values drop to the
 * defaults. Mirrors rockypoint-net `apps/web/src/lib/admin/review-query.ts`.
 */
export const reviewQueueQuery = z.object({
  status: z.enum(REVIEW_QUEUE_FILTERS).catch("open"),
  subject: z.enum(REVIEW_SUBJECTS).or(z.literal("")).catch(""),
  cursor: z
    .string()
    .regex(CURSOR)
    .transform((c) => c.toLowerCase())
    .or(z.literal(""))
    .catch(""),
});
export type ReviewQueueView = z.infer<typeof reviewQueueQuery>;

/** The API query for a view (`limit` fixed, empty values left out). */
export const reviewQueueApiQuery = (view: ReviewQueueView) => ({
  status: view.status,
  subject: view.subject || undefined,
  cursor: view.cursor || undefined,
  limit: REVIEW_PAGE_SIZE,
});

/** `/sites/rpn/` plus non-default params in a fixed order (status, subject, cursor), so links stay canonical. */
export function reviewQueueHref(view: Partial<ReviewQueueView>): string {
  const params = new URLSearchParams();
  if (view.status && view.status !== "open") params.set("status", view.status);
  if (view.subject) params.set("subject", view.subject);
  if (view.cursor) params.set("cursor", view.cursor);
  const qs = params.toString();
  return `/sites/rpn/${qs ? `?${qs}` : ""}`;
}

export const ESCAPIA_ASSIGNEE_FILTERS = ["", "unassigned", "me"] as const;

/** `/sites/rpn/escapia?assignee=` — empty = everything pending. */
export const escapiaQueueQuery = z.object({
  assignee: z.enum(["unassigned", "me"]).or(z.literal("")).catch(""),
});
export type EscapiaQueueView = z.infer<typeof escapiaQueueQuery>;

export const escapiaQueueApiQuery = (view: EscapiaQueueView) => ({
  assignee: view.assignee || undefined,
  limit: 200,
});

export const escapiaQueueHref = (view: Partial<EscapiaQueueView>): string =>
  `/sites/rpn/escapia/${view.assignee ? `?assignee=${view.assignee}` : ""}`;
