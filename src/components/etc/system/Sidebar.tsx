import { component$ } from "@builder.io/qwik";
import { gridSectionClass } from "~/common/consts";
import { NavLink } from "./Navlink";
import SidebarAvatar from "./SidebarAvatar";

export default component$(() => {
  const menuItems: Array<{
    type: "separator" | "item";
    label?: string;
    icon?: string;
    href?: string;
  }> = [
    { type: "separator", label: "Main" },
    {
      type: "item",
      label: "Dashboard",
      icon: "dashboard",
      href: "/home/dashboard",
    },
    { type: "separator", label: "Server" },
    {
      type: "item",
      label: "Infra",
      icon: "lan",
      href: "/home/infrastructure",
    },
    {
      type: "item",
      label: "Backups",
      icon: "backup",
      href: "/home/backups",
    },
    { type: "separator", label: "Etc" },
    {
      type: "item",
      label: "IoT",
      icon: "door_sensor",
      href: "/home/iot",
    },
    {
      type: "item",
      label: "Leads",
      icon: "patient_list",
      href: "/home/leads",
    },
    //{ type: "separator", label: "Etc" },
    //{ type: "item", label: "Profile", icon: "person", href: "/home/profile" },
  ];

  return (
    <div class={["h-fill flex flex-col gap-4", gridSectionClass]}>
      <a
        class="flex cursor-pointer flex-row content-between gap-1"
        href="/home"
      >
        <img
          src={`/favicon.png`}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          class="max-h-18 mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left object-cover p-2"
        />
        <h6 class="my-3 flex items-center border-l-4 border-gray-300 ps-4 text-start text-gray-500 dark:border-gray-600 dark:text-gray-300">
          Oceano Admin
        </h6>
      </a>

      <div class="flex w-full flex-row items-center gap-2">
        <hr class="w-full rounded-b-full border-1 border-gray-300 opacity-75 dark:border-gray-600" />
        <small class="text-gray-500 dark:text-gray-300">Home</small>
        <hr class="w-full rounded-b-full border-1 border-gray-300 opacity-75 dark:border-gray-600" />
      </div>

      <div class="h-fill flex w-full flex-col justify-between">
        <div class="flex w-full flex-col">
          {menuItems.map((item, index) => {
            if (item.type === "separator") {
              return (
                <p
                  key={index}
                  class="m-2 font-bold text-gray-500 opacity-30 dark:text-gray-300"
                >
                  {item.label}
                </p>
              );
            }

            return (
              <NavLink
                key={index}
                href={item.href!}
                activeClass="bg-gray-200 dark:bg-gray-600 text-sky-600 dark:text-sky-400"
                class="group mb-3 flex cursor-pointer flex-row content-between gap-1 rounded-md p-2 font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-sky-600 dark:text-gray-300 hover:dark:bg-gray-600 hover:dark:text-sky-400"
              >
                <span class="material-symbol mr-2 self-center text-lg text-inherit">
                  {item.icon}
                </span>
                <span class="self-center text-lg text-inherit transition-all duration-200">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>

        <SidebarAvatar />
      </div>
    </div>
  );
});
