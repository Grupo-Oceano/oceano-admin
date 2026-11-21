import { component$ } from "@qwik.dev/core";
import { Menu, MenuButton, MenuHeading, MenuItem, MenuItems, button } from "~/components/ui";
import type { SessionView } from "~/lib/auth/session";
import { navFor } from "./nav";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

/** Top bar: on phones and tablets it carries the navigation menu and the account menu. */
export default component$<{ session: SessionView }>(({ session }) => (
  <div class="flex flex-row items-center justify-between gap-2 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
    <div class="flex flex-row items-center gap-2">
      <div class="lg:hidden">
        <Menu>
          <MenuButton
            class={button({ intent: "ghost", size: "icon" })}
            aria-label="Navigation"
            testId="nav-menu"
          >
            <span class="material-symbols-rounded" aria-hidden="true">
              menu
            </span>
          </MenuButton>
          <MenuItems anchor="bottom start">
            {navFor(session).map((item) =>
              item.type === "separator" ? (
                <MenuHeading key={item.label}>{item.label}</MenuHeading>
              ) : (
                <MenuItem key={item.href} href={item.href}>
                  <span class="material-symbols-rounded text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </MenuItem>
              ),
            )}
          </MenuItems>
        </Menu>
      </div>
      <a href="/" class="px-2 font-semibold text-gray-700 lg:hidden dark:text-gray-200">
        Oceano Admin
      </a>
    </div>
    <div class="flex flex-row items-center gap-2">
      <ThemeToggle />
      <div class="lg:hidden">
        <UserMenu session={session} compact />
      </div>
    </div>
  </div>
));
