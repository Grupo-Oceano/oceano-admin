import { $, component$, useContext } from "@builder.io/qwik";
import {
  QuickActions,
  RecentEvents,
  ServiceTable,
  SystemHealth,
  SystemOverview,
} from "~/components/business/infrastructure";
import ConnectionIndicator from "~/components/business/infrastructure/ConnectionIndicator";
import { InfrastructureContext } from "~/lib/stores/infrastructure.store";

export default component$(() => {
  const {
    services,
    metrics,
    loading,
    lastUpdate,
    error,

    // WebSocket connection states
    isRealtimeEnabled,
    connectionStatus,
    reconnectAttempts,
  } = useContext(InfrastructureContext);

  const handleQuickAction = $(async (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions via WebSocket
    // Example: sendServiceAction("all", action);
  });

  if (loading) {
    return (
      <div class="h-fill flex items-center justify-center p-6">
        <div class="flex flex-col items-center gap-4">
          <div class="mb-4 h-24 w-24 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p class="text-gray-600 dark:text-gray-400">
            Connecting to infrastructure monitoring...
          </p>
        </div>
      </div>
    );
  }

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
          <ConnectionIndicator
            status={connectionStatus}
            lastUpdate={lastUpdate}
            reconnectAttempts={reconnectAttempts}
            onReconnect={() => {}}
            onDisconnect={() => {}}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div class="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 dark:border-red-700 dark:bg-red-900">
          <div class="flex items-center gap-2">
            <span class="text-red-500">🔴</span>
            <span class="font-medium text-red-700 dark:text-red-300">
              Error:
            </span>
            <span class="text-red-600 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* System Overview Cards */}
      <SystemOverview metrics={metrics} />

      {/* Services Table */}
      <ServiceTable services={services} onServiceAction={() => {}} />

      {/* Quick Stats Footer */}
      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <RecentEvents />
        <SystemHealth />
        <QuickActions
          onRestartAll={() => handleQuickAction("restart-all")}
          onViewMetrics={() => handleQuickAction("view-metrics")}
          onMaintenance={() => handleQuickAction("maintenance")}
          onExportLogs={() => handleQuickAction("export-logs")}
        />
      </div>
    </div>
  );
});
