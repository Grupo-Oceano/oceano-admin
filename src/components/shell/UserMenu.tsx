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
import { mayManageAccess } from "~/features/access/policy";
import type { SessionView } from "~/lib/auth/session";

/** The signed-in staff member; its menu holds "Sign out" (a plain POST form: works without JS). */
export default component$<{ session: SessionView; compact?: boolean }>(
  ({ session, compact }) => {
    const { staff } = session;
    return (
      <Menu>
        <MenuButton
          class={`flex items-center gap-3 rounded-lg p-2 text-start hover:bg-gray-200 dark:hover:bg-gray-600 pointer-coarse:min-h-11${compact ? "" : "w-full"}`}
          aria-label={
            compact ? `Account: ${staff.name || staff.email}` : undefined
          }
          testId="user-menu"
        >
          <Avatar name={staff.name || staff.email} />
          {!compact && (
            <span class="flex min-w-0 flex-col">
              <span class="truncate font-medium text-gray-900 dark:text-white">
                {staff.name || staff.email}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {staff.isOwner
                  ? "Owner"
                  : mayManageAccess(session)
                    ? "Access manager"
                    : "Staff"}
              </span>
            </span>
          )}
        </MenuButton>
        <MenuItems anchor={compact ? "bottom end" : "top start"}>
          <MenuHeading>{staff.email}</MenuHeading>
          <MenuItem href="/">Sites</MenuItem>
          <MenuSeparator />
          <form method="post" action="/auth/logout">
            <MenuItem type="submit" class="justify-between" testId="logout">
              Sign out
              <span class="material-symbols-rounded" aria-hidden="true">
                logout
              </span>
            </MenuItem>
          </form>
        </MenuItems>
      </Menu>
    );
  },
);
