import { $, component$, QRL } from "@builder.io/qwik";
import { useToast } from "flowbite-qwik";
import { dateToReader } from "~/common/masks/dates";
import Icon from "~/components/etc/ui/Icon";
import TableBase, {
  TableBaseConfig,
  TableColumn,
} from "~/components/etc/ui/TableBase";
import type { ServicesStatus } from "~/models/infra.model";

interface ServicesTableProps {
  services: ServicesStatus | null;
  onServiceAction: QRL<(serviceId: string, action: string) => void>;
}

export default component$<ServicesTableProps>(
  ({ services, onServiceAction }) => {
    const { add } = useToast();

    const getStatusColor = $((status: string) => {
      switch (status) {
        case "running":
          return "text-green-500";
        case "warning":
          return "text-yellow-500";
        case "error":
          return "text-red-500";
        case "stopped":
          return "text-gray-500";
        default:
          return "text-gray-500";
      }
    });

    const getStatusIcon = $((state: string) => {
      switch (state) {
        case "running":
          return "🟢";
        case "warning":
          return "🟡";
        case "error":
          return "🔴";
        case "stopped":
          return "⚫";
        default:
          return "⚫";
      }
    });

    const handleServiceAction = $((serviceId: string, action: string) => {
      add({
        text: `This action hasn't been implemented yet.`,
        closable: true,
        type: "empty",
      });
      onServiceAction(serviceId, action);
    });

    const columns: TableColumn<ServicesStatus[0]>[] = [
      {
        header: "Service",
        renderCell: $((service) => (
          <div class="flex items-center whitespace-break-spaces">
            <span class="mr-3 text-2xl">{getStatusIcon(service.State)}</span>
            <div>
              <div class="text-sm font-medium break-words text-gray-900 dark:text-white">
                {service.Names}
              </div>
              <div class="text-sm break-words text-gray-500 dark:text-gray-400">
                {service.Id.length > 16 ? (
                  <span title={service.Id}>{service.Id.slice(0, 16)}...</span>
                ) : (
                  service.Id
                )}
              </div>
            </div>
          </div>
        )),
      },
      {
        header: "Status",
        renderCell: $((service) => (
          <span
            class={`text-sm font-medium capitalize ${getStatusColor(service.Status)}`}
          >
            {service.Status}
          </span>
        )),
      },
      {
        header: "CPU%",
        renderCell: $((service) =>
          service.stats?.cpu_stats?.cpu_usage?.total_usage
            ? (service.stats.cpu_stats.cpu_usage.total_usage / 1e12).toFixed(2)
            : "N/A",
        ),
      },
      {
        header: "Memory (MB)",
        renderCell: $((service) =>
          service.stats?.memory_stats?.usage
            ? (service.stats.memory_stats.usage / 1024 / 1024).toFixed(2)
            : "N/A",
        ),
      },
      {
        header: "Disk IO (MB)",
        renderCell: $((service) => (
          <span class="text-sm text-nowrap">
            {service.stats?.blkio_stats?.io_service_bytes_recursive
              ? service.stats.blkio_stats.io_service_bytes_recursive
                  .map(
                    (blk) =>
                      `${blk.op}: ${(blk.value / Math.pow(1000, 2)).toFixed(2)}`,
                  )
                  .join(", ")
              : "N/A"}
          </span>
        )),
      },
      {
        header: "Ports",
        renderCell: $((service) =>
          service.Ports && service.Ports.length > 0 ? (
            <div class="flex flex-col gap-1">
              {service.Ports.map((port, index) =>
                index % 2 ? (
                  <span key={index} class="flex items-center gap-2">
                    <span class="text-xs text-gray-700 dark:text-gray-300">
                      {port.PublicPort ?? "—"}
                    </span>
                    <span class="mx-1 text-gray-400">→</span>
                    <span class="text-xs text-gray-700 dark:text-gray-300">
                      {port.PrivatePort}
                    </span>
                    <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {port.Type?.toUpperCase()}
                    </span>
                  </span>
                ) : null,
              )}
            </div>
          ) : (
            <span class="text-xs text-gray-400">N/A</span>
          ),
        ),
      },
      {
        header: "Created",
        renderCell: $((service) => (
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {dateToReader(service.Created)}
          </span>
        )),
      },
      {
        header: "Actions",
        renderCell: $((service) => (
          <div class="flex gap-2">
            {service.Status === "running" ? (
              <>
                <button
                  onClick$={() => handleServiceAction(service.Id, "restart")}
                  class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                  title="Restart"
                >
                  <Icon icon="refresh" class="text-xl!" />
                </button>
                <button
                  onClick$={() => handleServiceAction(service.Id, "stop")}
                  class="text-red-600 hover:text-red-800 dark:text-red-400"
                  title="Stop"
                >
                  <Icon icon="stop" class="text-xl!" />
                </button>
              </>
            ) : (
              <button
                onClick$={() => handleServiceAction(service.Id, "start")}
                class="text-green-600 hover:text-green-800 dark:text-green-400"
                title="Start"
              >
                <Icon icon="resume" class="text-3xl!" />
              </button>
            )}
            <button
              onClick$={() => handleServiceAction(service.Id, "logs")}
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              title="View Logs"
            >
              <Icon icon="description" class="text-xl!" />
            </button>
          </div>
        )),
      },
    ];

    const config: TableBaseConfig<ServicesStatus[0]> = {
      columns,
      loadingRows: 3,
    };

    return (
      <div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div class="px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Services
          </h2>
        </div>

        <div class="px-3">
          <TableBase
            containerClass="shadow-none! bg-transparent!"
            config={config}
            data={services}
          />
        </div>
      </div>
    );
  },
);

{
  /* <div class="px-3">
          <div class="overflow-x-auto rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Service
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    CPU %
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Memory (MB)
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Disk IO (MB)
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Ports
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Last Updated
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {!services
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} class="animate-pulse">
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="h-4 rounded bg-gray-200"></div>
                        </td>
                      </tr>
                    ))
                  : services.map((service) => (
                      <tr
                        key={service.Id}
                        class="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td class="max-w-xs px-6 py-4 break-words whitespace-normal">
                          <div class="flex items-center">
                            <span class="mr-3 text-2xl">
                              {getStatusIcon(service.State)}
                            </span>
                            <div>
                              <div class="text-sm font-medium break-words text-gray-900 dark:text-white">
                                {service.Names}
                              </div>
                              <div class="text-sm break-words text-gray-500 dark:text-gray-400">
                                {service.Id.length > 16 ? (
                                  <span title={service.Id}>
                                    {service.Id.slice(0, 16)}...
                                  </span>
                                ) : (
                                  service.Id
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class={`text-sm font-medium capitalize ${getStatusColor(service.Status)}`}
                          >
                            {service.Status}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                          {service.stats?.cpu_stats?.cpu_usage?.total_usage
                            ? (
                                service.stats.cpu_stats.cpu_usage.total_usage /
                                1e10
                              ).toFixed(2)
                            : "N/A"}
                        </td>
                        <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                          {service.stats?.memory_stats?.usage
                            ? (
                                service.stats.memory_stats.usage /
                                1024 /
                                1024
                              ).toFixed(2)
                            : "N/A"}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex gap-1">
                            {service.stats?.blkio_stats
                              ?.io_service_bytes_recursive
                              ? service.stats.blkio_stats.io_service_bytes_recursive
                                  .map(
                                    (blk) =>
                                      `${blk.op}: ${(blk.value / Math.pow(1000, 2)).toFixed(2)}`,
                                  )
                                  .join(", ")
                              : "N/A"}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          {service.Ports && service.Ports.length > 0 ? (
                            <div class="flex flex-col gap-1">
                              {service.Ports.map((port, index) =>
                                index % 2 ? (
                                  <span
                                    key={index}
                                    class="flex items-center gap-2"
                                  >
                                    <span class="text-xs text-gray-700 dark:text-gray-300">
                                      {port.PublicPort ?? "—"}
                                    </span>
                                    <span class="mx-1 text-gray-400">→</span>
                                    <span class="text-xs text-gray-700 dark:text-gray-300">
                                      {port.PrivatePort}
                                    </span>
                                    <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      {port.Type?.toUpperCase()}
                                    </span>
                                  </span>
                                ) : null,
                              )}
                            </div>
                          ) : (
                            <span class="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {dateToReader(service.Created)}
                        </td>
                        <td class="px-6 py-4 text-sm whitespace-nowrap">
                          <div class="flex gap-2">
                            {service.Status === "running" ? (
                              <>
                                <button
                                  onClick$={() =>
                                    handleServiceAction(service.Id, "restart")
                                  }
                                  class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                                  title="Restart"
                                >
                                  <Icon icon="refresh" class="text-xl!" />
                                </button>
                                <button
                                  onClick$={() =>
                                    handleServiceAction(service.Id, "stop")
                                  }
                                  class="text-red-600 hover:text-red-800 dark:text-red-400"
                                  title="Stop"
                                >
                                  <Icon icon="stop" class="text-xl!" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick$={() =>
                                  handleServiceAction(service.Id, "start")
                                }
                                class="text-green-600 hover:text-green-800 dark:text-green-400"
                                title="Start"
                              >
                                <Icon icon="resume" class="text-3xl!" />
                              </button>
                            )}
                            <button
                              onClick$={() =>
                                handleServiceAction(service.Id, "logs")
                              }
                              class="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                              title="View Logs"
                            >
                              <Icon icon="description" class="text-xl!" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div> */
}
