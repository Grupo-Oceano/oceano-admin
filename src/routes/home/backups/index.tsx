import { component$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import BackupsTable from "~/components/modules/backups/BackupsTable";
import { heading } from "~/components/ui";
import { coreApi } from "~/lib/backends/core.server";
import type { ApiResponse } from "~/lib/backends/types";
import { loaderResult } from "~/lib/backends/unwrap.server";
import type { Backup } from "~/models/backups";

export const useBackups = routeLoader$(async (ev) =>
  loaderResult(
    ev,
    await coreApi(ev).get<ApiResponse<Backup[]>>("/oceano-infra/list-backups"),
  ),
);

/** Lists the infrastructure backups oceano-core reports. */
export default component$(() => {
  const backups = useBackups();
  return (
    <>
      <div class="mb-6 flex items-center justify-between">
        <div class="flex flex-col gap-2 px-6 lg:flex-row lg:gap-32">
          <div class="flex flex-row items-center gap-2">
            <span
              class="material-symbols-rounded text-5xl text-gray-600 dark:text-gray-300"
              aria-hidden="true"
            >
              backup
            </span>
            <h1 class={heading({ level: "page" })}>Backups</h1>
          </div>
          <p class="mt-1 text-sm text-gray-600 lg:text-end dark:text-gray-400">
            Manage, view, and restore backups. This page provides tools and
            information to help you safeguard and recover oceano's
            infrastructure data.
          </p>
        </div>
      </div>

      <BackupsTable
        backups={backups.value.data?.data ?? null}
        error={backups.value.error}
      />
    </>
  );
});
