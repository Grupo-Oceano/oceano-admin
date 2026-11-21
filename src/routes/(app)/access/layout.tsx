import { component$, Slot } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import Forbidden from "~/components/shell/Forbidden";
import NavLink from "~/components/shell/NavLink";
import { heading } from "~/components/ui";
import { accessDeniedOf, requireOwner } from "~/lib/auth/guard.server";

/** Owners only: anyone else gets a 403 page here (and every action re-checks). */
export const onRequest = requireOwner;

export const useAccessDenied = routeLoader$((ev) => accessDeniedOf(ev));

const tab =
  "rounded-full px-4 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 pointer-coarse:min-h-11 pointer-coarse:inline-flex pointer-coarse:items-center dark:text-gray-300 dark:hover:text-white";
const activeTab = "bg-surface text-gray-900 shadow-sm dark:text-white";

export default component$(() => {
  const denied = useAccessDenied();
  if (denied.value) return <Forbidden denied={denied.value} />;
  return (
    <div class="flex flex-col gap-4">
      <header class="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class={heading({ level: "page" })}>Access</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Who can sign in to Oceano Admin, and their role on each site.
          </p>
        </div>
        <nav aria-label="Access sections" class="inline-flex self-start rounded-full bg-surface-3 p-1">
          <NavLink href="/access/" class={tab} activeClass={activeTab}>
            Staff
          </NavLink>
          <NavLink href="/access/audit/" class={tab} activeClass={activeTab}>
            Audit log
          </NavLink>
        </nav>
      </header>
      <Slot />
    </div>
  );
});
