import { component$ } from "@qwik.dev/core";
import {
  Avatar,
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "~/components/ui";
import type { SessionUser } from "~/lib/auth/session";

/** The signed-in user at the bottom of the sidebar; its menu holds the links and "Log out". */
export default component$<{ user: SessionUser | null }>(({ user }) => (
  <Menu>
    <MenuButton
      class="flex w-full items-center gap-3 rounded-lg p-2 text-start hover:bg-gray-200 dark:hover:bg-gray-600"
      testId="user-menu"
    >
      <Avatar name={user?.username} />
      <span class="flex min-w-0 flex-col">
        <span class="truncate font-medium text-gray-900 dark:text-white">
          {user?.username}
        </span>
        <span class="text-sm text-gray-500 dark:text-gray-400">admin</span>
      </span>
    </MenuButton>
    <MenuItems anchor="top start">
      <MenuHeading>{user?.username}</MenuHeading>
      <MenuItem href="/home/dashboard">Dashboard</MenuItem>
      <MenuSeparator />
      {/* A plain form: the /logout endpoint clears the cookie and redirects, with or without JS. */}
      <form method="post" action="/logout">
        <MenuItem type="submit" class="justify-between" testId="logout">
          Log out
          <span class="material-symbols-rounded" aria-hidden="true">
            logout
          </span>
        </MenuItem>
      </form>
    </MenuItems>
  </Menu>
));
