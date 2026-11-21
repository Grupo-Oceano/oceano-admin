import { component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { SITE_MODULES } from "~/components/shell/nav";
import { Badge, card, heading } from "~/components/ui";
import { useSession } from "./layout";

const OCEANO_MODULES = [
  { href: "/dashboard/", icon: "dashboard", name: "Dashboard" },
  { href: "/infrastructure/", icon: "lan", name: "Infrastructure" },
  { href: "/backups/", icon: "backup", name: "Backups" },
  { href: "/iot/", icon: "door_sensor", name: "IoT" },
  { href: "/leads/", icon: "patient_list", name: "Leads" },
];

const tile =
  "flex items-start gap-3 rounded-lg p-4 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-sky-500";

/** The sites home: only the sites this staff member has (owners: every active site), then Oceano's modules. */
export default component$(() => {
  const session = useSession();
  const { staff, sites } = session.value;
  return (
    <div class="flex flex-col gap-8">
      <header class="flex flex-col gap-1 px-1">
        <h1 class={heading({ level: "page" })}>Hi {staff.name || staff.email}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {staff.isOwner ? "Owner: you can open every site and manage access." : "Your sites"}
        </p>
      </header>

      <section class="flex flex-col gap-3" data-testid="sites">
        <h2 class={heading({ level: "section", class: "px-1" })}>Sites</h2>
        {sites.length === 0 ? (
          <p class="px-1 text-gray-500 dark:text-gray-400">No sites yet.</p>
        ) : (
          <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sites.map((site) => {
              const module = SITE_MODULES[site.key];
              const body = (
                <>
                  <span class="material-symbols-rounded text-3xl text-sky-600 dark:text-sky-400" aria-hidden="true">
                    {module?.icon ?? "language"}
                  </span>
                  <span class="flex min-w-0 flex-col gap-1">
                    <span class="flex flex-wrap items-center gap-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{site.name}</span>
                      <Badge tone={site.role === "owner" ? "info" : "muted"}>{site.role}</Badge>
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {module?.description ?? "This site has no module in Oceano Admin yet."}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={site.key} class={card()} data-testid={`site-${site.key}`}>
                  {module ? (
                    <Link href={module.href} class={tile}>
                      {body}
                    </Link>
                  ) : (
                    <div class={tile}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section class="flex flex-col gap-3">
        <h2 class={heading({ level: "section", class: "px-1" })}>Oceano</h2>
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {OCEANO_MODULES.map((m) => (
            <li key={m.href} class={card()}>
              <Link href={m.href} class={[tile, "items-center"]}>
                <span class="material-symbols-rounded text-gray-500 dark:text-gray-400" aria-hidden="true">
                  {m.icon}
                </span>
                <span class="font-medium text-gray-900 dark:text-white">{m.name}</span>
              </Link>
            </li>
          ))}
          {staff.isOwner && (
            <li class={card()}>
              <Link href="/access/" class={[tile, "items-center"]}>
                <span class="material-symbols-rounded text-gray-500 dark:text-gray-400" aria-hidden="true">
                  admin_panel_settings
                </span>
                <span class="font-medium text-gray-900 dark:text-white">Access</span>
              </Link>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
});

export const head: DocumentHead = { title: "Oceano Admin" };
