import { mayManageAccess } from "~/features/access/policy";
import type { SessionView } from "~/lib/auth/session";

export type NavEntry =
  | { type: "separator"; label: string }
  | { type: "item"; label: string; icon: string; href: string };

/** Site modules this app has, by site key. A granted site without a module here isn't linked. */
export const SITE_MODULES: Record<
  string,
  { href: string; icon: string; description: string }
> = {
  rpn: {
    href: "/sites/rpn/",
    icon: "travel_explore",
    description:
      "Review partner companies and listings, and key Oceano-managed properties into Escapia.",
  },
};

/**
 * The shell's navigation for a session: the sites the staff member has, Access (owners and access managers), then the Oceano
 * operations modules. Those are visible to everyone signed in for now (no per-module grants yet).
 */
export function navFor(session: SessionView): NavEntry[] {
  const sites = session.sites.filter((s) => SITE_MODULES[s.key]);
  return [
    { type: "item", label: "Sites", icon: "home", href: "/" },
    ...(sites.length ? [{ type: "separator" as const, label: "Sites" }] : []),
    ...sites.map((s) => ({
      type: "item" as const,
      label: s.name,
      icon: SITE_MODULES[s.key].icon,
      href: SITE_MODULES[s.key].href,
    })),
    ...(mayManageAccess(session)
      ? [
          { type: "separator" as const, label: "Admin" },
          {
            type: "item" as const,
            label: "Access",
            icon: "admin_panel_settings",
            href: "/access/",
          },
        ]
      : []),
    { type: "separator", label: "Oceano" },
    {
      type: "item",
      label: "Dashboard",
      icon: "dashboard",
      href: "/dashboard/",
    },
    { type: "item", label: "Infra", icon: "lan", href: "/infrastructure/" },
    { type: "item", label: "Backups", icon: "backup", href: "/backups/" },
    { type: "item", label: "IoT", icon: "door_sensor", href: "/iot/" },
    { type: "item", label: "Leads", icon: "patient_list", href: "/leads/" },
    { type: "item", label: "UI", icon: "labs", href: "/ui-test/" },
  ];
}
