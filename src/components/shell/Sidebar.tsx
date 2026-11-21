import { component$ } from "@qwik.dev/core";
import { card, heading } from "~/components/ui";
import type { SessionView } from "~/lib/auth/session";
import { navFor } from "./nav";
import NavLink from "./NavLink";
import UserMenu from "./UserMenu";

/** Desktop navigation (lg and up); phones use the menu in `Uppernav`. */
export default component$<{ session: SessionView }>(({ session }) => (
  <div class={card({ tone: "panel", class: "flex h-full flex-col gap-4" })}>
    <a class="flex flex-row gap-1" href="/">
      <img
        src="/favicon.png"
        alt=""
        width={96}
        height={96}
        class="max-h-18 mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left object-cover p-2"
      />
      <h6 class="my-3 flex items-center border-l-4 border-gray-300 ps-4 text-start text-gray-500 dark:border-gray-600 dark:text-gray-300">
        Oceano Admin
      </h6>
    </a>

    <nav class="flex min-h-0 w-full flex-1 flex-col justify-between gap-4">
      <div class="flex w-full flex-col overflow-y-auto">
        {navFor(session).map((item) =>
          item.type === "separator" ? (
            <p key={item.label} class={heading({ level: "group", class: "m-2 opacity-60" })}>
              {item.label}
            </p>
          ) : (
            <NavLink
              key={item.href}
              href={item.href}
              activeClass="bg-gray-200 text-sky-600 dark:bg-gray-600 dark:text-sky-400"
              class="mb-1 flex flex-row items-center gap-3 rounded-md p-2 font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-sky-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-sky-400 pointer-coarse:min-h-11"
            >
              <span class="material-symbols-rounded text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </div>

      <UserMenu session={session} />
    </nav>
  </div>
));
