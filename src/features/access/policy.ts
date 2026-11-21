import type { ManageScope, SessionView } from "~/lib/auth/session";
import type { Site, StaffMember } from "./schema";

/**
 * What the `/access` page offers a viewer, mirroring oceano-core's `canManage` (access.policy.ts) so
 * nobody sees a button that can only fail. UI only: core decides every action again.
 *
 * Owners: everything. Access managers (`access.manage` for some sites or all sites): add staff, activate
 * pending people, disable people, and grant/revoke roles on their sites, never on owners, other managers or
 * themselves, and never for someone who has a role on a site outside their scope.
 */

export const ACCESS_MANAGE = "access.manage";

export type Viewer = { id: string; isOwner: boolean; manage: ManageScope };

export const NO_SCOPE: ManageScope = { all: false, sites: [] };

const hasScope = (scope: ManageScope) => scope.all || scope.sites.length > 0;

export const inScope = (scope: ManageScope, site: string): boolean =>
  scope.all || scope.sites.includes(site);

/** Owners and access managers may open `/access`. */
export const mayManageAccess = (session: SessionView): boolean =>
  session.staff.isOwner || hasScope(session.canManageAccess ?? NO_SCOPE);

export const viewerOf = (session: SessionView): Viewer => ({
  id: session.staff.id,
  isOwner: session.staff.isOwner,
  manage: session.staff.isOwner
    ? { all: true, sites: session.canManageAccess?.sites ?? [] }
    : (session.canManageAccess ?? NO_SCOPE),
});

/** Holds `access.manage` for any site. */
export const isAccessManager = (person: Pick<StaffMember, "permissions">) =>
  (person.permissions ?? []).some((p) => p.key === ACCESS_MANAGE);

export type Controls = {
  /** Owner, manager or yourself, seen by a manager: nothing to change here. */
  protected: boolean;
  /** The status button this viewer may press, if any. */
  status: "activate" | "disable" | null;
  /** Owner flag and permissions (owners only). */
  ownerControls: boolean;
  /** Site keys whose role this viewer may grant, change or revoke for this person. */
  grantSites: string[];
};

/** The controls a viewer gets for one person in the manage dialog. `sites` = the sites core listed for the viewer. */
export function controlsFor(
  viewer: Viewer,
  person: StaffMember,
  sites: Site[],
): Controls {
  if (viewer.isOwner) {
    return {
      protected: false,
      status: person.status === "active" ? "disable" : "activate",
      ownerControls: true,
      grantSites: sites.map((s) => s.key),
    };
  }
  const none: Controls = {
    protected: false,
    status: null,
    ownerControls: false,
    grantSites: [],
  };
  if (!hasScope(viewer.manage)) return none;
  if (person.isOwner || isAccessManager(person) || person.id === viewer.id)
    return { ...none, protected: true };

  const withinScope = person.grants.every((g) =>
    inScope(viewer.manage, g.site),
  );
  return {
    ...none,
    status: !withinScope
      ? null
      : person.status === "active"
        ? "disable"
        : person.status === "pending"
          ? "activate"
          : null,
    grantSites: sites
      .filter((s) => inScope(viewer.manage, s.key))
      .map((s) => s.key),
  };
}

/** `site` null as the label the dialog shows. */
export const scopeLabel = (site: string | null, sites: Site[]): string =>
  site === null
    ? "All sites"
    : (sites.find((s) => s.key === site)?.name ?? site);
