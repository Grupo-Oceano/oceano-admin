import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import Icon from "~/components/ui/Icon";

interface ServiceStatus {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "warning";
  uptime: string;
  cpu: number;
  memory: number;
  ports: string[];
  lastUpdated: string;
}

interface SystemMetrics {
  totalMemory: number;
  usedMemory: number;
  cpuUsage: number;
  diskUsage: number;
  activeServices: number;
  totalServices: number;
}

export default component$(() => {
  const services = useSignal<ServiceStatus[]>([]);
  const metrics = useSignal<SystemMetrics>({
    totalMemory: 15360,
    usedMemory: 8440,
    cpuUsage: 23,
    diskUsage: 67,
    activeServices: 6,
    totalServices: 8,
  });
  const selectedService = useSignal<string>("");
  const refreshing = useSignal(false);

  // Mock data initialization
  useVisibleTask$(() => {
    services.value = [
      {
        id: "oceano-webhook",
        name: "Oceano Webhook",
        status: "running",
        uptime: "2d 14h 32m",
        cpu: 12,
        memory: 256,
        ports: ["3000", "3001"],
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        id: "oceano-admin",
        name: "Oceano Admin",
        status: "running",
        uptime: "2d 14h 30m",
        cpu: 8,
        memory: 189,
        ports: ["3002"],
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        id: "oceano-sales",
        name: "Oceano Sales",
        status: "running",
        uptime: "2d 12h 15m",
        cpu: 15,
        memory: 312,
        ports: ["80", "443"],
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        id: "postgres-db",
        name: "PostgreSQL Database",
        status: "running",
        uptime: "7d 3h 42m",
        cpu: 5,
        memory: 512,
        ports: ["5432"],
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        id: "redis-cache",
        name: "Redis Cache",
        status: "warning",
        uptime: "1d 8h 20m",
        cpu: 3,
        memory: 128,
        ports: ["6379"],
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        id: "nginx-proxy",
        name: "Nginx Proxy",
        status: "running",
        uptime: "7d 3h 42m",
        cpu: 2,
        memory: 64,
        ports: ["80", "443"],
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        id: "monitoring",
        name: "Monitoring Service",
        status: "stopped",
        uptime: "0m",
        cpu: 0,
        memory: 0,
        ports: ["3003"],
        lastUpdated: "10:30 AM",
      },
      {
        id: "backup-service",
        name: "Backup Service",
        status: "error",
        uptime: "0m",
        cpu: 0,
        memory: 0,
        ports: ["3004"],
        lastUpdated: "09:15 AM",
      },
    ];
  });

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

  const handleRefresh = $(() => {
    refreshing.value = true;
    setTimeout(() => {
      // Update timestamps
      services.value = services.value.map((service) => ({
        ...service,
        lastUpdated: new Date().toLocaleTimeString(),
      }));
      refreshing.value = false;
    }, 1000);
  });

  const handleServiceAction = $((serviceId: string, action: string) => {
    console.log(`${action} service: ${serviceId}`);
    // Mock action implementation
  });

  return (
    <div class="min-h-screen p-6">
      {/* Header */}
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Infrastructure Management
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage your Oceano infrastructure services
          </p>
        </div>
        <div class="flex gap-3">
          <button
            onClick$={handleRefresh}
            disabled={refreshing.value}
            class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Icon
              icon="refresh"
              class={refreshing.value ? "animate-spin" : ""}
            />
            {refreshing.value ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg bg-white p-6 shadow-lg transition-all duration-200 hover:-translate-0.5 hover:shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Active Services
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.value.activeServices}/{metrics.value.totalServices}
              </p>
            </div>
            <div class="text-2xl">🚀</div>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2 rounded-full bg-teal-500"
              style={`width: ${(metrics.value.activeServices / metrics.value.totalServices) * 100}%`}
            ></div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-lg transition-all duration-200 hover:-translate-0.5 hover:shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.value.cpuUsage}%
              </p>
            </div>
            <div class="text-2xl">💻</div>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2 rounded-full bg-blue-600"
              style={`width: ${metrics.value.cpuUsage}%`}
            ></div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-lg transition-all duration-200 hover:-translate-0.5 hover:shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Memory</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  (metrics.value.usedMemory / metrics.value.totalMemory) * 100,
                )}
                %
              </p>
            </div>
            <div class="text-2xl">🧠</div>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2 rounded-full bg-green-600"
              style={`width: ${(metrics.value.usedMemory / metrics.value.totalMemory) * 100}%`}
            ></div>
          </div>
          <p class="mt-1 min-w-1/4 text-xs text-gray-500">
            {metrics.value.usedMemory} MB / {metrics.value.totalMemory} MB
          </p>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-lg transition-all duration-200 hover:-translate-0.5 hover:shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Disk Usage</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.value.diskUsage}%
              </p>
            </div>
            <div class="text-2xl">💾</div>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2 rounded-full bg-yellow-600"
              style={`width: ${metrics.value.diskUsage}%`}
            ></div>
          </div>
        </div>
      </div>

      {/* Services Table */}
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
              {services.value.map((service) => (
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

      {/* Quick Stats Footer */}
      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Events
          </h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <span class="text-green-500">🟢</span>
              <span class="text-gray-600 dark:text-gray-400">
                Service restart completed
              </span>
              <span class="min-w-1/4 text-xs text-gray-500">2m ago</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span class="text-yellow-500">🟡</span>
              <span class="text-gray-600 dark:text-gray-400">
                High memory usage detected
              </span>
              <span class="min-w-1/4 text-xs text-gray-500">15m ago</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span class="text-blue-500">🔵</span>
              <span class="text-gray-600 dark:text-gray-400">
                Deployment successful
              </span>
              <span class="min-w-1/4 text-xs text-gray-500">1h ago</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            System Health
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Network
              </span>
              <span class="text-sm text-green-600">Healthy</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Database
              </span>
              <span class="text-sm text-green-600">Optimal</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Cache
              </span>
              <span class="text-sm text-yellow-600">Warning</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Storage
              </span>
              <span class="text-sm text-green-600">Good</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
          <div class="space-y-3">
            <button class="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
              🔄 Restart All Services
            </button>
            <button class="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
              📊 View Full Metrics
            </button>
            <button class="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
              🛠️ System Maintenance
            </button>
            <button class="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
              📋 Export Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
