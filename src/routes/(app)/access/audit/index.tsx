import { component$ } from "@qwik.dev/core";
import { Link, routeLoader$, type DocumentHead } from "@qwik.dev/router";
import { button, DataTable, type Column } from "~/components/ui";
import { accessErrorMessage } from "~/features/access/errors";
import {
  auditQuery,
  type AuditEntry,
  type AuditPage,
  type StaffMember,
} from "~/features/access/schema";
import { isOwner, requireOwner } from "~/lib/auth/guard.server";
import { coreApi } from "~/lib/backends/core.server";
import type { ApiResponse } from "~/lib/backends/types";
import { loaderResult } from "~/lib/backends/unwrap.server";
import { searchKeys, searchObject } from "~/lib/crud/search-keys";
import { formatDateTime } from "~/lib/utils/format";

/** One audit row as the table shows it: names resolved from the staff list. */
type AuditRow = AuditEntry & { actor: string; target: string; change: string };

const compact = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const json = JSON.stringify(value);
  return json.length > 160 ? `${json.slice(0, 157)}…` : json;
};

/** Owners only (access managers get the layout's 403 page here). */
export const onRequest = requireOwner;

/** Access audit, newest first, keyset-paged by `cursor` (oceano-core `GET /admin/audit`). Owners only. */
export const useAudit = routeLoader$(
  async (ev) => {
    const query = auditQuery.parse(searchObject(ev.url.searchParams));
    if (!isOwner(ev)) return { query, rows: [], nextCursor: null, error: null };
    const core = coreApi(ev);
    const [audit, staff] = await Promise.all([
      core.get<ApiResponse<AuditPage>>("/admin/audit", {
        limit: query.limit,
        cursor: query.cursor,
      }),
      core.get<ApiResponse<StaffMember[]>>("/admin/staff"),
    ]);
    const page = loaderResult(ev, audit, { message: accessErrorMessage });
    const people = new Map(
      (staff[1]?.data ?? []).map((s) => [s.id, s.name || s.email]),
    );
    const nameOf = (id: string | null) =>
      id ? (people.get(id) ?? id) : "system";
    const rows: AuditRow[] = (page.data?.data.items ?? []).map((item) => {
      // Grant targets are `<staffId>:<site>`; permission targets `<staffId>:<key>:<site or *>`.
      const [staffId, a, b] = item.targetId.split(":");
      const target =
        b !== undefined
          ? `${nameOf(staffId)}: ${a} on ${b === "*" ? "all sites" : b}`
          : a
            ? `${nameOf(staffId)} on ${a}`
            : nameOf(item.targetId);
      return {
        ...item,
        actor: nameOf(item.actorId),
        target,
        change: [compact(item.before), compact(item.after)]
          .filter(Boolean)
          .join(" → "),
      };
    });
    return {
      query,
      rows,
      nextCursor: page.data?.data.nextCursor ?? null,
      error: page.error,
    };
  },
  { search: searchKeys(auditQuery) },
);

const When = component$<{ row: AuditRow }>(({ row }) => (
  <span class="whitespace-nowrap">{formatDateTime(row.createdAt)}</span>
));
const Change = component$<{ row: AuditRow }>(({ row }) => (
  <code class="text-xs break-all text-gray-600 dark:text-gray-300">
    {row.change}
  </code>
));

const columns: Column<AuditRow>[] = [
  { key: "createdAt", header: "When", cell: When },
  { key: "actor", header: "Who" },
  { key: "action", header: "Action", class: "font-medium" },
  { key: "target", header: "Target", hideBelow: "sm" },
  { key: "change", header: "Change", cell: Change, hideBelow: "lg" },
];

export default component$(() => {
  const audit = useAudit();
  const { query, rows, nextCursor, error } = audit.value;
  return (
    <DataTable
      columns={columns}
      rows={rows}
      error={error}
      rowKey="id"
      emptyText="No changes recorded."
      testId="audit"
    >
      {(query.cursor || nextCursor) && (
        <nav
          q:slot="footer"
          class="flex items-center justify-between gap-4 border-t border-gray-200 p-3 dark:border-gray-700"
        >
          {query.cursor ? (
            <Link
              href="/access/audit/"
              class={button({ intent: "secondary", size: "sm" })}
            >
              First page
            </Link>
          ) : (
            <span />
          )}
          {nextCursor && (
            <Link
              href={`/access/audit/?cursor=${nextCursor}`}
              rel="next"
              class={button({ intent: "secondary", size: "sm" })}
              data-testid="audit-next"
            >
              Older
              <span class="material-symbols-rounded" aria-hidden="true">
                chevron_right
              </span>
            </Link>
          )}
        </nav>
      )}
    </DataTable>
  );
});

export const head: DocumentHead = { title: "Audit log - Oceano Admin" };
