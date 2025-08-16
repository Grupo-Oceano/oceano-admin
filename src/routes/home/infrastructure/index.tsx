import { $, component$, useContext } from "@builder.io/qwik";
import {
  QuickActions,
  RecentEvents,
  ServicesTable,
  SystemHealth,
  SystemOverview,
} from "~/components/modules/infrastructure";
import ConnectionIndicator from "~/components/modules/infrastructure/ConnectionIndicator";
import { InfrastructureContext } from "~/lib/stores/infrastructure.store";

export default component$(() => {
  const { services, metrics, lastUpdate } = useContext(InfrastructureContext);

  const handleRestartAll = $(async () => {
    console.log(`Quick action: restart-all`);
    // Implement restart all services via WebSocket
    // Example: sendServiceAction("all", "restart");
  });

  const handleViewMetrics = $(async () => {
    console.log(`Quick action: view-metrics`);
    // Implement view metrics action
    // Example: navigate to metrics page or open modal
  });

  const handleMaintenance = $(async () => {
    console.log(`Quick action: maintenance`);
    // Implement maintenance mode toggle
    // Example: sendServiceAction("all", "maintenance");
  });

  const handleExportLogs = $(async () => {
    console.log(`Quick action: export-logs`);
    // Implement logs export functionality
    // Example: downloadLogs();
  });

  const onServiceAction$ = $((serviceId: string, action: string) => {
    console.log({ serviceId, action });
  });

  /* if (loading) {
    return (
      <div class="h-fill flex items-center justify-center p-6">
        <Skeleton classes="h-32" />
        <div class="flex flex-col items-center gap-4">
          <div class="mb-4 h-24 w-24 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p class="text-gray-600 dark:text-gray-400">
            Connecting to infrastructure monitoring...
          </p>
        </div>
      </div>
    );
  }
 */
  return (
    <div class="min-h-screen p-6 pt-0">
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
          <ConnectionIndicator
            status={"connected"}
            lastUpdate={lastUpdate}
            reconnectAttempts={0}
            /* onReconnect={() => {}}
            onDisconnect={() => {}} */
          />
        </div>
      </div>

      {/* System Overview Cards */}
      <SystemOverview metrics={metrics} />

      {/* Error Display */}
      {/* {error && (
        <div class="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 dark:border-red-700 dark:bg-red-900">
          <div class="flex items-center gap-2">
            <span class="text-red-500">🔴</span>
            <span class="font-medium text-red-700 dark:text-red-300">
              Error:
            </span>
            <span class="text-red-600 dark:text-red-400">{error}</span>
          </div>
        </div>
      )} */}

      {/* Services Table */}
      <ServicesTable services={services} onServiceAction={onServiceAction$} />

      {/* Quick Stats Footer */}
      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <RecentEvents />
        <SystemHealth />
        <QuickActions
          onRestartAll={handleRestartAll}
          onViewMetrics={handleViewMetrics}
          onMaintenance={handleMaintenance}
          onExportLogs={handleExportLogs}
        />
      </div>
    </div>
  );
});
