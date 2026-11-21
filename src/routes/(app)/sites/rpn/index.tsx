import { component$ } from "@qwik.dev/core";
import { Link, routeLoader$, type DocumentHead } from "@qwik.dev/router";
import { Badge, button, DataTable, type Column } from "~/components/ui";
import { rpnLoaderOptions } from "~/features/rpn/actions.server";
import { REVIEW_QUEUE_FILTERS, type ReviewQueueItem, type ReviewQueuePage } from "~/features/rpn/contract";
import {
  QUEUE_TABS,
  REQUEST_STATUS,
  requestTone,
  SUBJECT_FILTERS,
  SUBJECT_LABEL,
  labelOf,
} from "~/features/rpn/labels";
import { reviewQueueApiQuery, reviewQueueHref, reviewQueueQuery } from "~/features/rpn/query";
import { siteRoleOf } from "~/lib/auth/guard.server";
import { rpnCall } from "~/lib/backends/rpn.server";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { searchKeys, searchObject } from "~/lib/crud/search-keys";
import { formatDateTime } from "~/lib/utils/format";

/** The review queue: status tab, subject filter and keyset cursor all live in the URL. */
export const useReviewQueue = routeLoader$(
  async (ev) => {
    const view = reviewQueueQuery.parse(searchObject(ev.url.searchParams));
    if (!siteRoleOf(ev, "rpn")) return { view, items: [], nextCursor: null, error: null };
    const { data, error } = loaderResult(
      ev,
      await rpnCall(ev, (api) => api.get<ReviewQueuePage>("/admin/review-queue", reviewQueueApiQuery(view))),
      rpnLoaderOptions,
    );
    return { view, items: data?.items ?? [], nextCursor: data?.nextCursor ?? null, error };
  },
  { search: searchKeys(reviewQueueQuery) },
);

const Title = component$<{ row: ReviewQueueItem }>(({ row }) => (
  <Link
    href={`/sites/rpn/requests/${row.id}/`}
    class="flex min-w-0 flex-col font-medium text-sky-700 hover:underline dark:text-sky-300"
    data-testid={`request-${row.id}`}
  >
    <span class="truncate">{row.listing?.name ?? row.partner.companyName}</span>
    <span class="text-xs font-normal text-gray-500 dark:text-gray-400">
      {SUBJECT_LABEL[row.subject]}
      {row.listing && <> · {row.partner.companyName}</>}
      {row.previousStatus === "rejected" && <> · Resubmission</>}
    </span>
  </Link>
));

const When = component$<{ row: ReviewQueueItem }>(({ row }) => (
  <span class="whitespace-nowrap text-sm">
    {row.reviewedAt ? `Decided ${formatDateTime(row.reviewedAt)}` : `Sent ${formatDateTime(row.createdAt)}`}
  </span>
));

const Status = component$<{ row: ReviewQueueItem }>(({ row }) => (
  <Badge tone={requestTone(row.status)}>{labelOf(REQUEST_STATUS, row.status)}</Badge>
));

const columns: Column<ReviewQueueItem>[] = [
  { key: "id", header: "Request", cell: Title },
  { key: "createdAt", header: "When", cell: When, hideBelow: "sm" },
  { key: "status", header: "Status", cell: Status, align: "end" },
];

const pill = (active: boolean) =>
  button({ intent: active ? "primary" : "secondary", size: "sm" });

export default component$(() => {
  const queue = useReviewQueue();
  const { view, items, nextCursor, error } = queue.value;
  return (
    <div class="flex flex-col gap-3">
      <p class="px-1 text-sm text-gray-500 dark:text-gray-400">
        Open requests are oldest first. Decided ones are newest first.
      </p>
      <DataTable
        columns={columns}
        rows={items}
        error={error}
        rowKey="id"
        emptyText="There are no requests in this view."
        testId="review-queue"
      >
        <div q:slot="toolbar" class="flex flex-col gap-3 border-b border-gray-200 p-3 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">
          <nav aria-label="Request status" class="flex flex-wrap gap-2">
            {REVIEW_QUEUE_FILTERS.map((status) => (
              <Link
                key={status}
                href={reviewQueueHref({ status, subject: view.subject })}
                aria-current={view.status === status ? "page" : undefined}
                class={pill(view.status === status)}
              >
                {QUEUE_TABS[status]}
              </Link>
            ))}
          </nav>
          <nav aria-label="Request type" class="flex flex-wrap gap-2">
            {(["", "partner", "listing"] as const).map((subject) => (
              <Link
                key={subject || "all"}
                href={reviewQueueHref({ status: view.status, subject })}
                aria-current={view.subject === subject ? "page" : undefined}
                class={pill(view.subject === subject)}
              >
                {SUBJECT_FILTERS[subject]}
              </Link>
            ))}
          </nav>
        </div>
        {(view.cursor || nextCursor) && (
          <nav q:slot="footer" class="flex items-center justify-between gap-4 border-t border-gray-200 p-3 dark:border-gray-700">
            {view.cursor ? (
              <Link href={reviewQueueHref({ ...view, cursor: "" })} class={button({ intent: "secondary", size: "sm" })}>
                Back to first page
              </Link>
            ) : (
              <span />
            )}
            {nextCursor && (
              <Link
                href={reviewQueueHref({ ...view, cursor: nextCursor })}
                rel="next"
                class={button({ intent: "secondary", size: "sm" })}
                data-testid="review-next"
              >
                Next page
                <span class="material-symbols-rounded" aria-hidden="true">
                  chevron_right
                </span>
              </Link>
            )}
          </nav>
        )}
      </DataTable>
    </div>
  );
});

export const head: DocumentHead = { title: "Review queue - RockyPoint.net - Oceano Admin" };
