import { component$ } from "@builder.io/qwik";

interface Props {
  error: string;
}

export default component$<Props>(({ error }) => {
  return (
    <div class="flex min-h-[200px] flex-grow items-center justify-center">
      <div class="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 shadow-md dark:border-red-700 dark:bg-red-900/30">
        <span class="material-symbols-rounded text-5xl! text-red-500 dark:text-red-200">
          error
        </span>
        <p class="text-lg font-semibold text-red-700 dark:text-red-300">
          An error occurred
        </p>
        <p class="text-center text-sm text-red-500 dark:text-red-200">
          {error}
        </p>
      </div>
    </div>
  );
});
