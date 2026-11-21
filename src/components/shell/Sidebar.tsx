import { component$ } from "@qwik.dev/core";
import { card, heading } from "~/components/ui";
import type { SessionUser } from "~/lib/auth/session";
import NavLink from "./NavLink";
import UserMenu from "./UserMenu";

type MenuEntry =
  | { type: "separator"; label: string }
  | { type: "item"; label: string; icon: string; href: string };

const menu: MenuEntry[] = [
  { type: "separator", label: "Main" },
  {
    type: "item",
    label: "Dashboard",
    icon: "dashboard",
    href: "/home/dashboard",
  },
  { type: "separator", label: "Server" },
  { type: "item", label: "Infra", icon: "lan", href: "/home/infrastructure" },
  { type: "item", label: "Backups", icon: "backup", href: "/home/backups" },
  { type: "separator", label: "Etc" },
  { type: "item", label: "IoT", icon: "door_sensor", href: "/home/iot" },
  { type: "item", label: "Leads", icon: "patient_list", href: "/home/leads" },
  { type: "item", label: "UI", icon: "labs", href: "/home/ui-test" },
];

export default component$<{ user: SessionUser | null }>(({ user }) => (
  <div class={card({ tone: "panel", class: "flex h-full flex-col gap-4" })}>
    <a class="flex flex-row gap-1" href="/home">
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

    <div class="flex w-full flex-row items-center gap-2">
      <hr class="w-full border-gray-300 opacity-75 dark:border-gray-600" />
      <small class="text-gray-500 dark:text-gray-300">Home</small>
      <hr class="w-full border-gray-300 opacity-75 dark:border-gray-600" />
    </div>

    <nav class="flex min-h-0 w-full flex-1 flex-col justify-between">
      <div class="flex w-full flex-col overflow-y-auto">
        {menu.map((item) =>
          item.type === "separator" ? (
            <p
              key={item.label}
              class={heading({ level: "group", class: "m-2 opacity-60" })}
            >
              {item.label}
            </p>
          ) : (
            <NavLink
              key={item.href}
              href={item.href}
              activeClass="bg-gray-200 text-sky-600 dark:bg-gray-600 dark:text-sky-400"
              class="mb-3 flex flex-row items-center gap-3 rounded-md p-2 font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-sky-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-sky-400 pointer-coarse:min-h-11"
            >
              <span class="material-symbols-rounded text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span class="text-lg">{item.label}</span>
            </NavLink>
          ),
        )}
      </div>

      <UserMenu user={user} />
    </nav>
  </div>
));
