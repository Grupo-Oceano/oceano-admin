import { component$, Slot } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import Sidebar from "~/components/shell/Sidebar";
import Uppernav from "~/components/shell/Uppernav";
import { requireStaff, sessionOf } from "~/lib/auth/guard.server";
import type { SessionView } from "~/lib/auth/session";

/** Every signed-in route: Entra session → oceano-core `/admin/me` (lib/auth/guard.server.ts). */
export const onRequest = requireStaff;

/** `{ staff, sites }` from oceano-core. Never the token: that stays in server memory. */
export const useSession = routeLoader$((ev): SessionView => {
  const session = sessionOf(ev);
  // The guard always sets it; without one there is nothing safe to render.
  if (!session) throw ev.redirect(302, "/auth/login");
  return { staff: session.staff, sites: session.sites };
});

export default component$(() => {
  const session = useSession();
  return (
    <div class="min-h-dvh bg-gray-200 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-4 lg:p-4 dark:bg-gray-800">
      <aside class="hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100dvh-2rem)]">
        <Sidebar session={session.value} />
      </aside>
      <div class="flex min-w-0 flex-col gap-4 p-3 sm:p-4 lg:p-0">
        <Uppernav session={session.value} />
        <main class="min-w-0">
          <Slot />
        </main>
      </div>
    </div>
  );
});
