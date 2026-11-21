import { $, component$, useContext } from "@qwik.dev/core";
import {
  ConnectionIndicator,
  QuickActions,
  RecentEvents,
  ServicesTable,
  SystemHealth,
  SystemOverview,
} from "~/components/modules/infrastructure";
import { heading } from "~/components/ui";
import { InfrastructureContext } from "~/lib/stores/infrastructure-store";

export default component$(() => {
  const infra = useContext(InfrastructureContext);

  // Quick actions aren't wired to the backend yet.
  const handleRestartAll = $(() => console.log("Quick action: restart-all"));
  const handleViewMetrics = $(() => console.log("Quick action: view-metrics"));
  const handleMaintenance = $(() => console.log("Quick action: maintenance"));
  const handleExportLogs = $(() => console.log("Quick action: export-logs"));

  return (
    <div class="min-h-dvh p-6 pt-0">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="px-6">
          <h1 class={heading({ level: "page" })}>Infrastructure Management</h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage Oceano infrastructure services
          </p>
        </div>
        <ConnectionIndicator
          status={infra.status}
          lastUpdate={infra.lastUpdate}
          reconnectAttempts={infra.reconnectAttempts}
        />
      </div>

      <SystemOverview metrics={infra.metrics} />

      <ServicesTable services={infra.services} />

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
