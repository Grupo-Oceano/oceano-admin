import { component$, useContext } from "@qwik.dev/core";
import { Badge, Button, type Column } from "~/components/ui";
import type { StaffMember, StaffStatus } from "~/features/access/schema";
import { formatDateTime } from "~/lib/utils/format";
import { StaffPageCtx } from "./context";

export const STATUS_TONE: Record<
  StaffStatus,
  "warning" | "success" | "danger"
> = {
  pending: "warning",
  active: "success",
  disabled: "danger",
};

const Person = component$<{ row: StaffMember }>(({ row }) => (
  <div class="flex min-w-0 flex-col">
    <span class="flex flex-wrap items-center gap-2 font-medium">
      {row.name || "(no name)"}
      {row.isOwner && <Badge tone="info">Owner</Badge>}
    </span>
    <span class="text-sm text-gray-500 dark:text-gray-400">{row.email}</span>
  </div>
));

const Status = component$<{ row: StaffMember }>(({ row }) => (
  <Badge tone={STATUS_TONE[row.status]} testId={`status-${row.id}`}>
    {row.status}
  </Badge>
));

const Sites = component$<{ row: StaffMember }>(({ row }) =>
  row.isOwner ? (
    <span class="text-sm text-gray-500 dark:text-gray-400">Every site</span>
  ) : row.grants.length ? (
    <span class="flex flex-wrap gap-1">
      {row.grants.map((g) => (
        <Badge key={g.site}>
          {g.site}: {g.role}
        </Badge>
      ))}
    </span>
  ) : (
    <span class="text-sm text-gray-500 dark:text-gray-400">None</span>
  ),
);

const LastSignIn = component$<{ row: StaffMember }>(({ row }) => (
  <span class="text-sm whitespace-nowrap">
    {row.lastSignInAt
      ? formatDateTime(row.lastSignInAt)
      : row.entraOid
        ? "—"
        : "Never signed in"}
  </span>
));

const Manage = component$<{ row: StaffMember }>(({ row }) => {
  const page = useContext(StaffPageCtx);
  return (
    <Button
      size="sm"
      intent="secondary"
      icon="tune"
      onClick$={() => (page.manageId = row.id)}
      testId={`manage-${row.id}`}
    >
      Manage
    </Button>
  );
});

export const staffColumns: Column<StaffMember>[] = [
  { key: "name", header: "Person", cell: Person },
  { key: "status", header: "Status", cell: Status },
  { key: "grants", header: "Sites", cell: Sites, hideBelow: "md" },
  {
    key: "lastSignInAt",
    header: "Last sign-in",
    cell: LastSignIn,
    hideBelow: "lg",
  },
  { key: "id", header: "", cell: Manage, align: "end" },
];
