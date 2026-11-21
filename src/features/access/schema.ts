import { z } from "@qwik.dev/router";

/**
 * oceano-core's access endpoints (docs/architecture/multi-site-admin.md, "oceano-core endpoints"), as zod
 * schemas for the BFF's loaders and actions. The rules mirror the core DTOs (`access.dto.ts`); core
 * validates again.
 */

export const STAFF_STATUSES = ["pending", "active", "disabled"] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

const SITE_KEY = /^[a-z0-9][a-z0-9-]{0,31}$/;
const ROLE = /^[a-z][a-z0-9_-]{0,31}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `/access?status=`: empty = everyone (pending first). */
export const staffQuery = z.object({
  status: z.enum(STAFF_STATUSES).or(z.literal("")).catch(""),
});
export type StaffQuery = z.infer<typeof staffQuery>;

/** `/access/audit?cursor=&limit=` */
export const auditQuery = z.object({
  cursor: z.string().regex(UUID).or(z.literal("")).catch(""),
  limit: z.coerce.number().int().min(1).max(200).catch(50),
});
export type AuditQuery = z.infer<typeof auditQuery>;

const staffId = z.string().regex(UUID, "Unknown staff member.");

/** POST /admin/staff */
export const createStaffInput = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254),
  name: z.string().trim().min(1, "Enter a name.").max(200),
});

/** PATCH /admin/staff/:id { status } */
export const setStatusInput = z.object({
  id: staffId,
  status: z.enum(["active", "disabled"]),
});

/** PATCH /admin/staff/:id { isOwner }. Form values arrive as strings. */
export const setOwnerInput = z.object({
  id: staffId,
  isOwner: z.enum(["true", "false"]).transform((v) => v === "true"),
});

/** PUT /admin/staff/:id/grants/:site { role } */
export const putGrantInput = z.object({
  id: staffId,
  site: z.string().regex(SITE_KEY, "Choose a site."),
  role: z.string().regex(ROLE, "Choose a role."),
});

/** DELETE /admin/staff/:id/grants/:site */
export const revokeGrantInput = z.object({
  id: staffId,
  site: z.string().regex(SITE_KEY),
});

// ---- Response shapes (core sends dates as ISO strings) ----

export type Grant = {
  site: string;
  role: string;
  grantedBy: string | null;
  grantedAt: string;
};

export type StaffMember = {
  id: string;
  email: string;
  name: string;
  status: StaffStatus;
  isOwner: boolean;
  entraOid: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
  grants: Grant[];
};

export type Site = {
  key: string;
  name: string;
  roles: string[];
  active: boolean;
};

export type AuditEntry = {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  createdAt: string;
};

export type AuditPage = { items: AuditEntry[]; nextCursor: string | null };

const STATUS_ORDER: Record<StaffStatus, number> = {
  pending: 0,
  active: 1,
  disabled: 2,
};

/** Pending first (new sign-ins waiting for an owner), then active, then disabled; by name within each. */
export const sortStaff = (rows: StaffMember[]): StaffMember[] =>
  [...rows].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      (a.name || a.email).localeCompare(b.name || b.email),
  );
