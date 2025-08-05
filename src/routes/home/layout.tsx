import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { gridSectionClass } from "~/common/consts";
import Sidebar from "~/components/etc/system/Sidebar";
import Uppernav from "~/components/etc/system/Uppernav";

export default component$(() => {
  const someServiceDown = useSignal(false);

  useVisibleTask$(() => {
    setTimeout(() => {
      console.log("Simulating a service going down");
      someServiceDown.value = true;
    }, 2500); // Simulate a service going down after 5 seconds
  });

  return (
    <div class="grid h-screen w-screen grid-cols-10 grid-rows-10 flex-col gap-4 bg-gray-200 p-4 dark:bg-gray-800">
      <div class="col-span-2 row-span-10 content-normal">
        <Sidebar />
      </div>
      <div class="col-span-6 row-span-1">
        <Uppernav />
      </div>
      <div class={["col-span-2 row-span-3", gridSectionClass]}>
        <div class="h-fill flex flex-col px-2" title="This is mocked data">
          <h3 class="mb-3 text-lg font-semibold text-gray-700 lg:text-2xl dark:text-white">
            System Status
          </h3>
          <div class="flex flex-grow flex-col justify-between px-2">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
                <small class="text-sm text-gray-800 lg:text-base dark:text-gray-300">
                  All Services Online
                </small>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-blue-500"></div>
                <small class="dark:text-gray-3 text-sm text-gray-800 lg:text-base">
                  Availability: 99.99%
                </small>
              </div>

              {someServiceDown.value && (
                <div class="animate-slide-up flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <small class="dark:text-gray-3 text-sm text-gray-800 lg:text-base">
                    Some services are down
                  </small>
                </div>
              )}
            </div>

            <small class="text-xs text-gray-500 lg:text-sm dark:text-gray-400">
              Last Updated: {new Date().toLocaleTimeString()}
            </small>
          </div>
        </div>
      </div>
      <div class="col-span-6 row-span-9 overflow-auto">
        <Slot />
      </div>
      <div class={["col-span-2 row-span-8", gridSectionClass]}>Logs</div>
    </div>
  );
});
