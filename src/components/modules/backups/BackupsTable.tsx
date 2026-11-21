import { component$ } from "@qwik.dev/core";
import { card, DataTable, heading, type Column } from "~/components/ui";
import type { Backup } from "~/models/backups";

const columns: Column<Backup>[] = [
  { key: "name", header: "Name" },
  { key: "size", header: "Size" },
  { key: "access", header: "Access", hideBelow: "lg" },
  { key: "modify", header: "Modify" },
  { key: "change", header: "Change", hideBelow: "lg" },
  { key: "birth", header: "Birth", hideBelow: "md" },
];

export default component$<{ backups: Backup[] | null; error: string | null }>(
  ({ backups, error }) => (
    <div class={card()}>
      <div class="px-6 py-4">
        <h2 class={heading()}>List of backups</h2>
      </div>
      <div class="px-3 pb-3">
        <DataTable
          flat
          columns={columns}
          rows={backups ?? (error ? [] : null)}
          error={error}
          rowKey="name"
          loadingRows={3}
          testId="backups"
        />
      </div>
    </div>
  ),
);
