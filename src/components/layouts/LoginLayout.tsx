import { component$, Slot } from "@builder.io/qwik";
import ThemeToggle from "../ThemeToggle";

export default component$(() => {
  return (
    <div
      class={`bg-[url(/assets/bg${Math.floor(Math.random() * 3) + 1}.jpg)] flex min-h-screen min-w-screen flex-col bg-cover bg-center`}
    >
      <div
        class={`float-left m-10 flex flex-grow justify-center rounded-2xl bg-gray-100 p-10 shadow-2xl md:w-3/5 lg:w-2/5 lg:p-6 xl:p-10 2xl:w-2/6 dark:bg-gray-800`}
      >
        <div class="flex flex-grow flex-col">
          <div class="h-1/5">
            <div class="flex flex-row content-between gap-4">
              <img
                src={`/favicon.png`}
                alt=""
                class="max-w-24 mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left object-cover p-2"
              />
              <h3 class="my-3 flex items-center border-l-4 border-gray-300 ps-4 text-start text-2xl font-bold text-gray-500 dark:border-gray-600 dark:text-gray-300">
                Oceano Admin
              </h3>
            </div>
          </div>

          <div class="flex h-4/5 flex-row justify-center">
            <Slot />
          </div>
        </div>
      </div>

      <ThemeToggle classes="absolute bottom-5 right-5" />
    </div>
  );
});
