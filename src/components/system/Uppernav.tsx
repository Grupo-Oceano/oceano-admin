import { component$ } from "@builder.io/qwik";
import ThemeToggle from "../ThemeToggle";

export default component$(() => {
  return (
    <div class="flex flex-row items-center justify-between rounded-full border-gray-300 bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700">
      <div class="flex flex-row items-center gap-2"></div>
      <ThemeToggle />
    </div>
  );
});
