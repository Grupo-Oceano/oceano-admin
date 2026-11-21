import { $, component$, useSignal } from "@qwik.dev/core";
import { routeLoader$, useNavigate, z } from "@qwik.dev/router";
import { button, DataTable, Paginator, type Column } from "~/components/ui";
import { coreApi } from "~/lib/backends/core.server";
import type { ApiGetAllResponse } from "~/lib/backends/types";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { formatDateTime } from "~/lib/utils/format";
import type { Guest } from "~/models/leads.model";

const TAKE_OPTIONS = [10, 25, 50, 100, 200] as const;

/** The URL owns the page: `?offset=&take=`, with defaults for anything missing or malformed. */
const leadsQuery = z.object({
  offset: z.coerce.number().int().min(0).catch(0),
  take: z.coerce.number().int().min(1).max(200).catch(10),
});

export const useLeads = routeLoader$(
  async (ev) => {
    const query = leadsQuery.parse({
      offset: ev.url.searchParams.get("offset") ?? undefined,
      take: ev.url.searchParams.get("take") ?? undefined,
    });
    const { data, error } = loaderResult(
      ev,
      await coreApi(ev).get<ApiGetAllResponse<Guest>>(
        `/guests/leads/${query.offset}/${query.take}`,
      ),
    );
    return { query, rows: data?.data ?? [], total: data?.total ?? 0, error };
  },
  { search: ["offset", "take"] },
);

const CreatedAt = component$<{ row: Guest }>(({ row }) => (
  <>{formatDateTime(row.createdAt)}</>
));
const UpdatedAt = component$<{ row: Guest }>(({ row }) => (
  <>{formatDateTime(row.updatedAt)}</>
));

const columns: Column<Guest>[] = [
  { key: "id", header: "ID", class: "font-medium whitespace-nowrap" },
  {
    key: "fname",
    header: "First Name",
    class: "font-medium whitespace-nowrap",
  },
  { key: "lname", header: "Last Name" },
  { key: "email", header: "Email" },
  { key: "macAddress", header: "MAC Address", hideBelow: "lg" },
  { key: "createdAt", header: "Created At", cell: CreatedAt, hideBelow: "md" },
  { key: "updatedAt", header: "Updated At", cell: UpdatedAt, hideBelow: "lg" },
];

/** Guests registered through the Paz del Mar and Oceano guest Wi-Fi captive portals. */
export default component$(() => {
  const leads = useLeads();
  const nav = useNavigate();
  const busy = useSignal(false);

  const setPage$ = $(async (next: { offset: number; take: number }) => {
    busy.value = true;
    try {
      await nav(`?offset=${next.offset}&take=${next.take}`, {
        replaceState: true,
      });
    } finally {
      busy.value = false;
    }
  });

  return (
    <div class="flex flex-col gap-4">
      <div class="mx-6 flex items-center justify-between gap-4">
        <small class="p-3 text-xs text-gray-500 dark:text-gray-400">
          Here you can see people registered through Paz del Mar and Oceano
          guests WIFI
        </small>
        {/* An endpoint streams the CSV from oceano-core, so the download works without JS. */}
        <a
          href="/home/leads/download"
          download
          class={button({ intent: "success" })}
          data-testid="leads-export"
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            vertical_align_bottom
          </span>
          Export
        </a>
      </div>

      <DataTable
        columns={columns}
        rows={leads.value.rows}
        error={leads.value.error}
        rowKey="id"
        loadingRows={leads.value.query.take}
        class={busy.value ? "opacity-60" : undefined}
        testId="leads"
      >
        <Paginator
          q:slot="footer"
          total={leads.value.total}
          offset={leads.value.query.offset}
          take={leads.value.query.take}
          takeOptions={TAKE_OPTIONS}
          disabled={busy.value}
          onChange$={setPage$}
          testId="leads-paginator"
        />
      </DataTable>
    </div>
  );
});
