import {
  component$,
  isBrowser,
  Slot,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import Sidebar from "~/components/shell/Sidebar";
import Uppernav from "~/components/shell/Uppernav";
import { card } from "~/components/ui";
import { SESSION_USER, type SessionUser } from "~/lib/auth/session";

/** The signed-in user the root guard resolved (username only). */
export const useUser = routeLoader$(
  (ev) => (ev.sharedMap.get(SESSION_USER) as SessionUser | undefined) ?? null,
);

export default component$(() => {
  const user = useUser();
  const someServiceDown = useSignal(false);

  // Mocked status panel, kept from v1: the task runs on the server, so this timer never fires there.
  useTask$(() => {
    if (isBrowser) {
      setTimeout(() => (someServiceDown.value = true), 2500);
    }
  });

  return (
    <div class="grid h-dvh w-screen grid-cols-10 grid-rows-10 gap-4 bg-gray-200 p-4 dark:bg-gray-800">
      <div class="col-span-2 row-span-10 min-h-0">
        <Sidebar user={user.value} />
      </div>
      <div class="col-span-6 row-span-1">
        <Uppernav />
      </div>
      <div class={card({ tone: "panel", class: "col-span-2 row-span-3" })}>
        <div class="flex h-full flex-col px-2" title="This is mocked data">
          <h3 class="mb-3 text-lg font-semibold text-gray-700 xl:text-2xl dark:text-white">
            System Status
          </h3>
          <div class="flex grow flex-col justify-between px-2">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="size-3 rounded-full bg-green-500" />
                <small class="text-sm text-gray-800 xl:text-base dark:text-gray-300">
                  All Services Online
                </small>
              </div>
              <div class="flex items-center gap-2">
                <div class="size-3 rounded-full bg-blue-500" />
                <small class="text-sm text-gray-800 xl:text-base dark:text-gray-300">
                  Availability: 99.99%
                </small>
              </div>
              {someServiceDown.value && (
                <div class="animate-slide-up flex items-center gap-2">
                  <div class="size-3 rounded-full bg-yellow-500" />
                  <small class="text-sm text-gray-800 xl:text-base dark:text-gray-300">
                    Some services are down
                  </small>
                </div>
              )}
            </div>
            <small class="text-xs text-gray-500 xl:text-sm dark:text-gray-400">
              Last Updated: {new Date().toLocaleTimeString()}
            </small>
          </div>
        </div>
      </div>
      <div class="col-span-6 row-span-9 overflow-auto">
        <Slot />
      </div>
      <div class={card({ tone: "panel", class: "col-span-2 row-span-7" })}>
        Logs
      </div>
    </div>
  );
});
