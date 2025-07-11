import { component$ } from "@builder.io/qwik";
import ThemeToggle from "../ThemeToggle";

export default component$(() => {
  return (
    <div class="mt-6 flex flex-row justify-between rounded-full border-gray-300 bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700">
      Upper Navigation <ThemeToggle />
    </div>
  );
});
