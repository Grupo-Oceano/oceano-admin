import { component$, Slot } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import Forbidden from "~/components/shell/Forbidden";
import NavLink from "~/components/shell/NavLink";
import { Badge, heading } from "~/components/ui";
import {
  accessDeniedOf,
  requireSite,
  siteRoleOf,
} from "~/lib/auth/guard.server";

/** RockyPoint.net: staff with an rpn grant (owners have every site). No grant → 403 page. */
export const onRequest = requireSite("rpn");

export const useRpnAccess = routeLoader$((ev) => ({
  denied: accessDeniedOf(ev),
  role: siteRoleOf(ev, "rpn"),
}));

const tab =
  "rounded-full px-4 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center dark:text-gray-300 dark:hover:text-white";
const activeTab = "bg-surface text-gray-900 shadow-sm dark:text-white";

export default component$(() => {
  const access = useRpnAccess();
  if (access.value.denied)
    return <Forbidden denied={access.value.denied} siteName="RockyPoint.net" />;
  return (
    <div class="flex flex-col gap-4">
      <header class="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            class={heading({
              level: "page",
              class: "flex flex-wrap items-center gap-2",
            })}
          >
            RockyPoint.net
            {access.value.role && (
              <Badge tone="info">{access.value.role}</Badge>
            )}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Partner companies and listings waiting for a decision, and
            Oceano-managed properties to key into Escapia.
          </p>
        </div>
        <nav
          aria-label="RockyPoint.net sections"
          class="bg-surface-3 inline-flex self-start rounded-full p-1"
        >
          <NavLink href="/sites/rpn/" class={tab} activeClass={activeTab}>
            Review queue
          </NavLink>
          <NavLink
            href="/sites/rpn/escapia/"
            class={tab}
            activeClass={activeTab}
          >
            Escapia keying
          </NavLink>
        </nav>
      </header>
      <Slot />
    </div>
  );
});
