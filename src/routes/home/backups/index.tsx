import { component$ } from "@builder.io/qwik";
import BackupsTable from "~/components/modules/backups/BackupsTable";

/**
 * @module BackupsPage
 * @description
 * This module defines the main Backups page component for the admin interface.
 * It displays a header with an icon and title, and serves as the entry point
 * for managing and viewing backup-related information within the application.
 */
export default component$(() => {
  return (
    <>
      {/* Header */}
      <div class="mb-6 flex items-center justify-between">
        <div class="flex flex-col gap-2 px-6 lg:flex-row lg:gap-32">
          <div class="flex flex-row items-center gap-2">
            <span class="material-symbols-rounded text-5xl! text-gray-600 dark:text-gray-300">
              backup
            </span>
            <h1 class="text-2xl font-bold text-gray-700 dark:text-white">
              Backups
            </h1>
          </div>
          <p class="mt-1 text-sm text-gray-600 lg:text-end dark:text-gray-400">
            Manage, view, and restore backups. This page provides tools and
            information to help you safeguard and recover oceano's
            infrastructure data.
          </p>
        </div>
        <div class="flex gap-3"></div>
      </div>

      <BackupsTable />
    </>
  );
});
