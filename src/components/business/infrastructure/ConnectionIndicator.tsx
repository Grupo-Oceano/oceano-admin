import { component$ } from "@builder.io/qwik";
import type { ConnectionStatus } from "~/lib/stores/infrastructure.store";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  lastUpdate: Date | null;
  reconnectAttempts: number;
  onReconnect?: () => void;
  onDisconnect?: () => void;
}

export default component$<ConnectionIndicatorProps>(
  ({ status, lastUpdate, reconnectAttempts, onReconnect, onDisconnect }) => {
    const getStatusConfig = () => {
      switch (status) {
        case "connected":
          return {
            color: "text-green-500",
            bgColor: "bg-green-100 dark:bg-green-900",
            icon: "🟢",
            text: "Connected",
            showActions: true,
          };
        case "connecting":
          return {
            color: "text-blue-500",
            bgColor: "bg-blue-100 dark:bg-blue-900",
            icon: "🔵",
            text: "Connecting...",
            showActions: false,
          };
        case "reconnecting":
          return {
            color: "text-yellow-500",
            bgColor: "bg-yellow-100 dark:bg-yellow-900",
            icon: "🟡",
            text: `Reconnecting... (${reconnectAttempts}/5)`,
            showActions: true,
          };
        case "disconnected":
          return {
            color: "text-gray-500",
            bgColor: "bg-gray-100 dark:bg-gray-900",
            icon: "⚫",
            text: "Disconnected",
            showActions: true,
          };
        case "error":
          return {
            color: "text-red-500",
            bgColor: "bg-red-100 dark:bg-red-900",
            icon: "🔴",
            text: "Connection Error",
            showActions: true,
          };
        default:
          return {
            color: "text-gray-500",
            bgColor: "bg-gray-100 dark:bg-gray-900",
            icon: "⚫",
            text: "Unknown",
            showActions: false,
          };
      }
    };

    const config = getStatusConfig();

    return (
      <div
        class={`flex items-center gap-3 rounded-lg px-4 py-2 ${config.bgColor}`}
      >
        <div class="flex items-center gap-2">
          <span class="text-sm">{config.icon}</span>
          <span class={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>

        {lastUpdate && status === "connected" && (
          <span class="text-xs text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        )}

        {config.showActions && (
          <div class="ml-auto flex gap-2">
            {status === "disconnected" || status === "error" ? (
              <button
                onClick$={onReconnect}
                class="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
              >
                Reconnect
              </button>
            ) : status === "connected" ? (
              <button
                onClick$={onDisconnect}
                class="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
              >
                Disconnect
              </button>
            ) : null}
          </div>
        )}
      </div>
    );
  },
);
