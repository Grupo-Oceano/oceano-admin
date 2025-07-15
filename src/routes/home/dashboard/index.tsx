import { component$ } from "@builder.io/qwik";
import { gridSectionClass } from "~/common/consts";

export default component$(() => {
  return (
    <div class={["h-fill flex flex-col gap-4 border", gridSectionClass]}>
      <h1 class="text-xl font-bold text-gray-800 dark:text-gray-200">
        Dashboard
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Welcome to your dashboard! Here you can manage your settings, view
        statistics, and more.
      </p>
      {/* Additional dashboard content goes here */}
    </div>
  );
});
