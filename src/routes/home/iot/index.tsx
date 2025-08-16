import { component$ } from "@builder.io/qwik";
import { DevicesTable } from "~/components/modules/iot";

export default component$(() => {
  return (
    <div class="min-h-screen p-6 pt-0">
      {/* Header */}
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Internet of Things Management
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage your Oceano IoT devices for Oceano Rentals
          </p>
        </div>
      </div>

      <DevicesTable />
    </div>
  );
});
