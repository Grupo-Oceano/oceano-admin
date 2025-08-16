import { component$ } from "@builder.io/qwik";

interface HealthItem {
  name: string;
  status: "Healthy" | "Warning" | "Critical" | "Optimal" | "Good";
  color: string;
}

export default component$(() => {
  const healthItems: HealthItem[] = [
    { name: "Network", status: "Healthy", color: "text-green-600" },
    { name: "Database", status: "Optimal", color: "text-green-600" },
    { name: "Cache", status: "Warning", color: "text-yellow-600" },
    { name: "Storage", status: "Good", color: "text-green-600" },
  ];

  return (
    <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        System Health
      </h3>
      <div class="space-y-3">
        {healthItems.map((item, index) => (
          <div key={index} class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {item.name}
            </span>
            <span class={`text-sm ${item.color}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
