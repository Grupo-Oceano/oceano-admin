import { $, component$ } from "@qwik.dev/core";
import {
  card,
  DataTable,
  heading,
  Icon,
  useToast,
  type Column,
} from "~/components/ui";
import { formatDateTime } from "~/lib/utils/format";
import type {
  DockerContainerWithStats,
  ServicesStatus,
} from "~/models/infra.model";

type Service = DockerContainerWithStats;

const statusColor: Record<string, string> = {
  running: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  stopped: "text-gray-500",
};
const stateIcon: Record<string, string> = {
  running: "🟢",
  warning: "🟡",
  error: "🔴",
  stopped: "⚫",
};

const ServiceCell = component$<{ row: Service }>(({ row }) => (
  <div class="flex items-center whitespace-break-spaces">
    <span class="mr-3 text-2xl">{stateIcon[row.State] ?? "⚫"}</span>
    <div>
      <div class="text-sm font-medium break-words text-gray-900 dark:text-white">
        {row.Names}
      </div>
      <div class="text-sm break-words text-gray-500 dark:text-gray-400">
        {row.Id.length > 16 ? (
          <span title={row.Id}>{row.Id.slice(0, 16)}...</span>
        ) : (
          row.Id
        )}
      </div>
    </div>
  </div>
));

const StatusCell = component$<{ row: Service }>(({ row }) => (
  <span
    class={[
      "text-sm font-medium capitalize",
      statusColor[row.Status] ?? "text-gray-500",
    ]}
  >
    {row.Status}
  </span>
));

const CpuCell = component$<{ row: Service }>(({ row }) => {
  const usage = row.stats?.cpu_stats?.cpu_usage?.total_usage;
  return <>{usage ? (usage / 1e12).toFixed(2) : "N/A"}</>;
});

const MemoryCell = component$<{ row: Service }>(({ row }) => {
  const usage = row.stats?.memory_stats?.usage;
  return <>{usage ? (usage / 1024 / 1024).toFixed(2) : "N/A"}</>;
});

const DiskCell = component$<{ row: Service }>(({ row }) => (
  <span class="text-sm text-nowrap">
    {row.stats?.blkio_stats?.io_service_bytes_recursive
      ? row.stats.blkio_stats.io_service_bytes_recursive
          .map(
            (blk) => `${blk.op}: ${(blk.value / Math.pow(1000, 2)).toFixed(2)}`,
          )
          .join(", ")
      : "N/A"}
  </span>
));

const PortsCell = component$<{ row: Service }>(({ row }) =>
  row.Ports && row.Ports.length > 0 ? (
    <div class="flex flex-col gap-1">
      {row.Ports.map((port, index) =>
        index % 2 ? (
          <span
            key={index}
            class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
          >
            <span>{port.PublicPort ?? "—"}</span>
            <span class="mx-1 text-gray-400">→</span>
            <span>{port.PrivatePort}</span>
            <span class="ml-2 text-gray-500 dark:text-gray-400">
              {port.Type?.toUpperCase()}
            </span>
          </span>
        ) : null,
      )}
    </div>
  ) : (
    <span class="text-xs text-gray-400">N/A</span>
  ),
);

const CreatedCell = component$<{ row: Service }>(({ row }) => (
  <span class="text-sm text-gray-500 dark:text-gray-400">
    {formatDateTime(row.Created)}
  </span>
));

const actionButton = "cursor-pointer pointer-coarse:size-11";

/** Service actions aren't wired to the backend yet: each one toasts that and logs the request. */
const ActionsCell = component$<{ row: Service }>(({ row }) => {
  const { add } = useToast();
  const id = row.Id;
  const act = $((action: string) => {
    add("This action hasn't been implemented yet.", "info");
    console.log({ serviceId: id, action });
  });
  return (
    <div class="flex gap-2">
      {row.Status === "running" ? (
        <>
          <button
            type="button"
            onClick$={() => act("restart")}
            class={[
              actionButton,
              "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400",
            ]}
            title="Restart"
          >
            <Icon icon="refresh" class="text-xl" />
          </button>
          <button
            type="button"
            onClick$={() => act("stop")}
            class={[
              actionButton,
              "text-red-600 hover:text-red-800 dark:text-red-400",
            ]}
            title="Stop"
          >
            <Icon icon="stop" class="text-xl" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick$={() => act("start")}
          class={[
            actionButton,
            "text-green-600 hover:text-green-800 dark:text-green-400",
          ]}
          title="Start"
        >
          <Icon icon="resume" class="text-3xl" />
        </button>
      )}
      <button
        type="button"
        onClick$={() => act("logs")}
        class={[
          actionButton,
          "text-blue-600 hover:text-blue-800 dark:text-blue-400",
        ]}
        title="View Logs"
      >
        <Icon icon="description" class="text-xl" />
      </button>
    </div>
  );
});

const columns: Column<Service>[] = [
  { key: "Names", header: "Service", cell: ServiceCell },
  { key: "Status", header: "Status", cell: StatusCell },
  { key: "cpu", header: "CPU%", cell: CpuCell, hideBelow: "md" },
  { key: "memory", header: "Memory (MB)", cell: MemoryCell, hideBelow: "md" },
  { key: "disk", header: "Disk IO (MB)", cell: DiskCell, hideBelow: "lg" },
  { key: "Ports", header: "Ports", cell: PortsCell, hideBelow: "lg" },
  { key: "Created", header: "Created", cell: CreatedCell, hideBelow: "lg" },
  { key: "actions", header: "Actions", cell: ActionsCell },
];

export default component$<{ services: ServicesStatus | null }>(
  ({ services }) => (
    <div class={card()}>
      <div class="px-6 py-4">
        <h2 class={heading()}>Services</h2>
      </div>
      <div class="px-3 pb-3">
        <DataTable
          flat
          columns={columns}
          rows={services}
          rowKey="Id"
          loadingRows={3}
          testId="services"
        />
      </div>
    </div>
  ),
);
