// ThemeToggle.tsx
import { component$ } from "@builder.io/qwik";
import clsx from "clsx";
import { useDarkMode } from "flowbite-qwik";

interface Props {
  classes?: string;
}

export default component$<Props>(({ classes }) => {
  /* const darkMode = useSignal(false);

  useVisibleTask$(() => {
    // Apply stored theme on mount
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      darkMode.value = true;
    } else {
      document.documentElement.classList.remove("dark");
      darkMode.value = false;
    }
  }); */

  const { isDark, setDarkModeValue } = useDarkMode();

  return (
    <button
      title="Toggle dark mode"
      class={clsx(
        "flex h-auto w-auto cursor-pointer content-center items-center rounded-full border-2 border-transparent bg-zinc-200 p-1 text-gray-500 transition-all duration-300 ease-[cubic-bezier(0.95,0.05,0.795,0.035)] hover:border-gray-300 dark:bg-zinc-800 dark:text-gray-400 dark:hover:border-gray-600",
        classes,
      )}
      /* onClick$={() => {
        const html = document.documentElement;
        const isDark = html.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        darkMode.value = isDark;
      }} */

      onClick$={() => {
        setDarkModeValue(isDark.value ? "light" : "dark");
      }}
    >
      <span class="material-symbol text-xl leading-none">
        {isDark.value ? "dark_mode" : "light_mode"}
      </span>
    </button>
  );
});
