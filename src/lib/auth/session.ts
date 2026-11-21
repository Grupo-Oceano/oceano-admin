/**
 * What the browser may see of the signed-in staff member: oceano-core's `GET /admin/me` payload. Never the
 * Entra token. The guard leaves it in `ev.sharedMap[SESSION]`; `(app)/layout.tsx` exposes it with `useSession`.
 */
export const SESSION = "session.staff";

export type StaffStatus = "pending" | "active" | "disabled";

/** A site the staff member may open, with their role there (owners: every active site, role `owner`). */
export type SiteAccess = { key: string; name: string; role: string };

export type SessionView = {
  staff: {
    id: string;
    email: string;
    name: string;
    isOwner: boolean;
    status: StaffStatus;
  };
  sites: SiteAccess[];
};
