import { component$ } from "@builder.io/qwik";

interface Props {
  class?: string;
}

export default component$<Props>(({ class: classes = "" }) => {
  return (
    <div class={["h-16 w-32 animate-pulse", classes]}>
      <div class="h-full w-full rounded bg-gray-300 dark:bg-gray-600"></div>
    </div>
  );
});
