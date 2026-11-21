import { component$ } from "@qwik.dev/core";
import { card } from "~/components/ui";

export default component$(() => (
  <div class={card({ tone: "panel", class: "flex h-full flex-col gap-4" })}>
    <h1 class="text-xl font-bold text-gray-800 dark:text-gray-200">
      Dashboard
    </h1>
    <p class="text-gray-600 dark:text-gray-400">
      Welcome to your dashboard! Here you can manage your settings, view
      statistics, and more.
    </p>
  </div>
));
