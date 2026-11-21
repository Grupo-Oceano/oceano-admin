import { component$, Slot } from "@qwik.dev/core";

/** Title + body column used by every `/auth/*` page inside `LoginLayout`. */
export default component$<{ title: string }>(({ title }) => (
  <div class="flex w-full flex-col gap-4 lg:px-4">
    <div class="mb-2 flex flex-row items-center gap-2 whitespace-nowrap">
      <hr class="my-2 flex-1 border-gray-300 dark:border-gray-600" />
      <h1 class="font-bold text-sky-600 opacity-75 dark:text-sky-400">{title}</h1>
      <hr class="my-2 flex-1 border-gray-300 dark:border-gray-600" />
    </div>
    <Slot />
  </div>
));
