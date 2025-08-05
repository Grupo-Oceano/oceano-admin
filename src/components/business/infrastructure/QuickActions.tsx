import { component$ } from "@builder.io/qwik";

interface QuickAction {
  icon: string;
  label: string;
  action: () => void;
}

interface QuickActionsProps {
  onRestartAll: () => void;
  onViewMetrics: () => void;
  onMaintenance: () => void;
  onExportLogs: () => void;
}

export default component$<QuickActionsProps>(
  ({ onRestartAll, onViewMetrics, onMaintenance, onExportLogs }) => {
    const actions: QuickAction[] = [
      {
        icon: "🔄",
        label: "Restart All Services",
        action: onRestartAll,
      },
      {
        icon: "📊",
        label: "View Full Metrics",
        action: onViewMetrics,
      },
      {
        icon: "🛠️",
        label: "System Maintenance",
        action: onMaintenance,
      },
      {
        icon: "📋",
        label: "Export Logs",
        action: onExportLogs,
      },
    ];

    return (
      <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div class="space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick$={action.action}
              class="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  },
);
