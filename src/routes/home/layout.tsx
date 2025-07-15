import { component$, Slot } from "@builder.io/qwik";
import { gridSectionClass } from "~/common/consts";
import Logout from "~/components/system/Logout";
import Sidebar from "~/components/system/Sidebar";
import Uppernav from "~/components/system/Uppernav";
import { authGuard } from "~/lib/auth-guard";

export const onRequest = authGuard;

export default component$(() => {
  return (
    <div class="grid h-screen w-screen grid-cols-10 grid-rows-10 flex-col gap-4 bg-gray-200 p-4 dark:bg-gray-800">
      <div class="col-span-2 row-span-10 content-normal">
        <Sidebar />
      </div>
      <div class="col-span-6 row-span-1">
        <Uppernav />
      </div>
      <div class={["col-span-2 row-span-2", gridSectionClass]}>
        <Logout />
      </div>
      <div class="col-span-6 row-span-9">
        <Slot />
      </div>
      <div class={["col-span-2 row-span-8", gridSectionClass]}>Logs</div>
    </div>
  );
});
