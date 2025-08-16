import { component$ } from "@builder.io/qwik";

interface Event {
  icon: string;
  message: string;
  time: string;
  type: "success" | "warning" | "info";
}

export default component$(() => {
  const events: Event[] = [
    {
      icon: "🟢",
      message: "Service restart completed",
      time: "2m ago",
      type: "success",
    },
    {
      icon: "🟡",
      message: "High memory usage detected",
      time: "15m ago",
      type: "warning",
    },
    {
      icon: "🔵",
      message: "Deployment successful",
      time: "1h ago",
      type: "info",
    },
  ];

  return (
    <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Recent Events
      </h3>
      <div class="space-y-3">
        {events.map((event, index) => (
          <div key={index} class="flex items-center gap-3 text-sm">
            <span
              class={`${
                event.type === "success"
                  ? "text-green-500"
                  : event.type === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
              }`}
            >
              {event.icon}
            </span>
            <span class="text-gray-600 dark:text-gray-400">
              {event.message}
            </span>
            <span class="min-w-1/4 text-xs text-gray-500">{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
