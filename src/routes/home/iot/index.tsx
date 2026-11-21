import { component$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import { DevicesTable } from "~/components/modules/iot";
import { heading } from "~/components/ui";
import { coreApi } from "~/lib/backends/core.server";
import type { ApiResponse } from "~/lib/backends/types";
import { loaderResult } from "~/lib/backends/unwrap.server";
import type { SeamDevice, SeamPagination } from "~/models/iot.model";

export const useDevices = routeLoader$(async (ev) => {
  const { data, error } = loaderResult(
    ev,
    await coreApi(ev).get<
      ApiResponse<{ devices: SeamDevice[] }, { pagination?: SeamPagination }>
    >("/iot/devices"),
  );
  return {
    devices: data?.data.devices ?? [],
    pagination: data?.pagination ?? null,
    error,
  };
});

export default component$(() => {
  const devices = useDevices();
  return (
    <div class="min-h-dvh p-6 pt-0">
      <div class="mb-6 flex items-center justify-between">
        <div class="px-6">
          <h1 class={heading({ level: "page" })}>
            Internet of Things Management
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage Oceano IoT devices for Oceano Rentals
          </p>
        </div>
      </div>

      <DevicesTable
        devices={devices.value.devices}
        error={devices.value.error}
      />
    </div>
  );
});
