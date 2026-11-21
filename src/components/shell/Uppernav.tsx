import { component$ } from "@qwik.dev/core";
import ThemeToggle from "./ThemeToggle";

export default component$(() => (
  <div class="flex flex-row items-center justify-between rounded-full bg-gray-100 p-2 dark:bg-gray-700">
    <div class="flex flex-row items-center gap-2" />
    <ThemeToggle />
  </div>
));
