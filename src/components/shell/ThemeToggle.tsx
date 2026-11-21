import { component$, useSignal, useVisibleTask$ } from "@qwik.dev/core";
import { button } from "~/components/ui";
import { THEME_COOKIE } from "~/lib/theme";

/**
 * Flips `.dark` on <html> and remembers the choice in the `theme` cookie, which SSR reads for the first paint.
 */
export default component$<{ class?: string }>((props) => {
  const dark = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task -- reads the class SSR put on <html>
  useVisibleTask$(() => {
    dark.value = document.documentElement.classList.contains("dark");
  });

  return (
    <button
      type="button"
      title="Toggle dark mode"
      aria-pressed={dark.value}
      class={button({
        intent: "ghost",
        size: "icon",
        class: [
          "border-2 border-transparent bg-zinc-200 text-gray-500 hover:border-gray-300 dark:bg-zinc-800 dark:text-gray-400 dark:hover:border-gray-600",
          props.class,
        ],
      })}
      onClick$={() => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        document.cookie = `${THEME_COOKIE}=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
        dark.value = next;
      }}
    >
      <span
        class="material-symbols-rounded text-xl leading-none"
        aria-hidden="true"
      >
        {dark.value ? "dark_mode" : "light_mode"}
      </span>
    </button>
  );
});
