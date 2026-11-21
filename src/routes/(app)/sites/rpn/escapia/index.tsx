import { component$ } from "@qwik.dev/core";
import { Form, Link, routeAction$, routeLoader$, zod$, type DocumentHead } from "@qwik.dev/router";
import EscapiaStatus from "~/components/modules/rpn/EscapiaStatus";
import { Button, button, DataTable, type Column } from "~/components/ui";
import { rpnLoaderOptions, rpnWrite } from "~/features/rpn/actions.server";
import { listingIdInput, type EscapiaQueueItem, type EscapiaQueuePage } from "~/features/rpn/contract";
import { ASSIGNEE_FILTERS } from "~/features/rpn/labels";
import {
  ESCAPIA_ASSIGNEE_FILTERS,
  escapiaQueueApiQuery,
  escapiaQueueHref,
  escapiaQueueQuery,
} from "~/features/rpn/query";
import { siteRoleOf } from "~/lib/auth/guard.server";
import { rpnCall } from "~/lib/backends/rpn.server";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { searchKeys, searchObject } from "~/lib/crud/search-keys";
import { useActionToast } from "~/lib/crud/use-action-toast";
import { formatDateTime } from "~/lib/utils/format";

/** Approved Oceano-managed properties waiting to be keyed into Escapia, oldest approval first. */
export const useEscapiaQueue = routeLoader$(
  async (ev) => {
    const view = escapiaQueueQuery.parse(searchObject(ev.url.searchParams));
    if (!siteRoleOf(ev, "rpn")) return { view, items: [], error: null };
    const { data, error } = loaderResult(
      ev,
      await rpnCall(ev, (api) => api.get<EscapiaQueuePage>("/admin/escapia-queue", escapiaQueueApiQuery(view))),
      rpnLoaderOptions,
    );
    return { view, items: data?.items ?? [], error };
  },
  { search: searchKeys(escapiaQueueQuery) },
);

export const useClaim = routeAction$(
  ({ listingId }, ev) =>
    rpnWrite(ev, (api) => api.post<EscapiaQueueItem>(`/admin/properties/${listingId}/claim`), (item) => `You claimed ${item.name}.`),
  zod$(listingIdInput),
);

export const useUnclaim = routeAction$(
  ({ listingId }, ev) =>
    rpnWrite(ev, (api) => api.post<EscapiaQueueItem>(`/admin/properties/${listingId}/unclaim`), (item) => `${item.name} is unclaimed.`),
  zod$(listingIdInput),
);

const Property = component$<{ row: EscapiaQueueItem }>(({ row }) => (
  <Link
    href={`/sites/rpn/escapia/${row.listingId}/`}
    class="flex min-w-0 flex-col font-medium text-sky-700 hover:underline dark:text-sky-300"
    data-testid={`keying-${row.listingId}`}
  >
    <span class="truncate">{row.name}</span>
    <span class="text-xs font-normal text-gray-500 dark:text-gray-400">{row.partner.companyName}</span>
  </Link>
));

const Approved = component$<{ row: EscapiaQueueItem }>(({ row }) => (
  <span class="whitespace-nowrap text-sm">{row.approvedAt ? formatDateTime(row.approvedAt) : "—"}</span>
));

const Status = component$<{ row: EscapiaQueueItem }>(({ row }) => <EscapiaStatus item={row} />);

/** Claim / unclaim from the list; each is a plain form (works without JS). */
const Claim = component$<{ row: EscapiaQueueItem }>(({ row }) => {
  const claim = useClaim();
  const unclaim = useUnclaim();
  const action = row.assignee ? unclaim : claim;
  return (
    <Form action={action}>
      <input type="hidden" name="listingId" value={row.listingId} />
      <Button
        type="submit"
        size="sm"
        intent="secondary"
        icon={row.assignee ? "person_remove" : "front_hand"}
        loading={action.isRunning}
        testId={`${row.assignee ? "unclaim" : "claim"}-${row.listingId}`}
      >
        {row.assignee ? "Unclaim" : "Claim"}
      </Button>
    </Form>
  );
});

const columns: Column<EscapiaQueueItem>[] = [
  { key: "name", header: "Property", cell: Property },
  { key: "approvedAt", header: "Approved", cell: Approved, hideBelow: "md" },
  { key: "assignee", header: "Status", cell: Status },
  { key: "listingId", header: "", cell: Claim, align: "end" },
];

export default component$(() => {
  const queue = useEscapiaQueue();
  useActionToast(useClaim());
  useActionToast(useUnclaim());
  const { view, items, error } = queue.value;
  return (
    <div class="flex flex-col gap-3">
      <p class="px-1 text-sm text-gray-500 dark:text-gray-400">
        Key each property into Escapia's own setup, then paste its unit id back here. Claim one so nobody keys it twice.
      </p>
      <DataTable
        columns={columns}
        rows={items}
        error={error}
        rowKey="listingId"
        emptyText="Nothing is waiting for Escapia keying in this view."
        testId="escapia-queue"
      >
        <nav q:slot="toolbar" aria-label="Assignee" class="flex flex-wrap gap-2 border-b border-gray-200 p-3 dark:border-gray-700">
          {ESCAPIA_ASSIGNEE_FILTERS.map((assignee) => (
            <Link
              key={assignee || "all"}
              href={escapiaQueueHref({ assignee })}
              aria-current={view.assignee === assignee ? "page" : undefined}
              class={button({ intent: view.assignee === assignee ? "primary" : "secondary", size: "sm" })}
            >
              {ASSIGNEE_FILTERS[assignee]}
            </Link>
          ))}
        </nav>
      </DataTable>
    </div>
  );
});

export const head: DocumentHead = { title: "Escapia keying - RockyPoint.net - Oceano Admin" };
