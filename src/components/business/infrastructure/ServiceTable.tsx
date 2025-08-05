import { $, component$ } from "@builder.io/qwik";
import Icon from "~/components/etc/ui/Icon";
import { ServiceStatus } from "~/models/infra.model";

interface ServiceTableProps {
  services: ServiceStatus[];
  onServiceAction: (serviceId: string, action: string) => void;
}

export default component$<ServiceTableProps>(
  ({ services, onServiceAction }) => {
    const getStatusColor = (status: string) => {
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
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
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
    };

    const handleServiceAction = $((serviceId: string, action: string) => {
      onServiceAction(serviceId, action);
    });

    return (
      <div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div class="border-b-[1px] border-gray-300 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Services
          </h2>
        </div>

        <div class="overflow-x-auto rounded-lg">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Service
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Uptime
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Resources
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
              {services.map((service) => (
                <tr
                  key={service.id}
                  class="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="mr-3 text-2xl">
                        {getStatusIcon(service.status)}
                      </span>
                      <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {service.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class={`text-sm font-medium capitalize ${getStatusColor(service.status)}`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {service.uptime}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    <div>CPU: {service.cpu}%</div>
                    <div>RAM: {service.memory} MB</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex gap-1">
                      {service.ports.map((port) => (
                        <span
                          key={port}
                          class="inline-flex rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {port}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {service.lastUpdated}
                  </td>
                  <td class="px-6 py-4 text-sm whitespace-nowrap">
                    <div class="flex gap-2">
                      {service.status === "running" ? (
                        <>
                          <button
                            onClick$={() =>
                              handleServiceAction(service.id, "restart")
                            }
                            class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                            title="Restart"
                          >
                            <Icon icon="refresh" class="text-xl!" />
                          </button>
                          <button
                            onClick$={() =>
                              handleServiceAction(service.id, "stop")
                            }
                            class="text-red-600 hover:text-red-800 dark:text-red-400"
                            title="Stop"
                          >
                            <Icon icon="stop" class="text-3xl!" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick$={() =>
                            handleServiceAction(service.id, "start")
                          }
                          class="text-green-600 hover:text-green-800 dark:text-green-400"
                          title="Start"
                        >
                          <Icon icon="resume" class="text-3xl!" />
                        </button>
                      )}
                      <button
                        onClick$={() => handleServiceAction(service.id, "logs")}
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
      </div>
    );
  },
);
