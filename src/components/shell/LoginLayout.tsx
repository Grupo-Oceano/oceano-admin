import { component$, Slot } from "@qwik.dev/core";
import ThemeToggle from "./ThemeToggle";

/** Sign-in screen frame: a random background photo, the brand header and the form card. */
export default component$(() => {
  const bg = Math.floor(Math.random() * 3) + 1;
  return (
    <div
      class={`bg-[url(/assets/images/bg${bg}.jpg)] flex min-h-dvh flex-col bg-cover bg-center`}
    >
      <div class="m-4 flex grow justify-center rounded-2xl bg-gray-100 p-6 shadow-2xl sm:m-10 sm:p-10 md:w-3/5 lg:w-2/5 lg:p-6 xl:p-10 2xl:w-2/6 dark:bg-gray-800">
        <div class="flex grow flex-col">
          <div class="flex flex-row gap-4 pb-8">
            <img
              src="/favicon.png"
              alt=""
              width={96}
              height={96}
              class="max-w-24 mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left object-cover p-2"
            />
            <h3 class="my-3 flex items-center border-l-4 border-gray-300 ps-4 text-start text-2xl font-bold text-gray-500 dark:border-gray-600 dark:text-gray-300">
              Oceano Admin
            </h3>
          </div>
          <div class="flex grow flex-row justify-center">
            <Slot />
          </div>
        </div>
      </div>
      <ThemeToggle class="absolute right-5 bottom-5" />
    </div>
  );
});
