import { describe, expect, it } from "vitest";
import type { SessionView } from "~/lib/auth/session";
import { controlsFor, mayManageAccess, viewerOf, type Viewer } from "./policy";
import type { Site, StaffMember } from "./schema";

const sites: Site[] = [
  {
    key: "rpn",
    name: "RockyPoint.net",
    roles: ["admin", "moderator"],
    active: true,
  },
  { key: "shop", name: "Shop", roles: ["admin"], active: true },
];

const person = (over: Partial<StaffMember> = {}): StaffMember => ({
  id: "ana",
  email: "ana@gooceano.com",
  name: "Ana",
  status: "active",
  isOwner: false,
  entraOid: null,
  lastSignInAt: null,
  createdAt: "",
  updatedAt: "",
  grants: [],
  permissions: [],
  ...over,
});

const session = (over: Partial<SessionView> = {}): SessionView => ({
  staff: {
    id: "me",
    email: "me@gooceano.com",
    name: "Me",
    isOwner: false,
    status: "active",
  },
  sites: [],
  permissions: [],
  canManageAccess: { all: false, sites: [] },
  ...over,
});

const owner: Viewer = {
  id: "me",
  isOwner: true,
  manage: { all: true, sites: ["rpn", "shop"] },
};
const rpnManager: Viewer = {
  id: "me",
  isOwner: false,
  manage: { all: false, sites: ["rpn"] },
};
const plain: Viewer = {
  id: "me",
  isOwner: false,
  manage: { all: false, sites: [] },
};

describe("access page policy", () => {
  it("opens /access to owners and access managers only", () => {
    expect(
      mayManageAccess(
        session({ staff: { ...session().staff, isOwner: true } }),
      ),
    ).toBe(true);
    expect(
      mayManageAccess(
        session({ canManageAccess: { all: false, sites: ["rpn"] } }),
      ),
    ).toBe(true);
    expect(
      mayManageAccess(session({ canManageAccess: { all: true, sites: [] } })),
    ).toBe(true);
    expect(mayManageAccess(session())).toBe(false);
    expect(
      viewerOf(session({ canManageAccess: { all: false, sites: ["rpn"] } }))
        .manage,
    ).toEqual({
      all: false,
      sites: ["rpn"],
    });
  });

  it("gives owners every control", () => {
    expect(
      controlsFor(owner, person({ isOwner: true, id: "x" }), sites),
    ).toEqual({
      protected: false,
      status: "disable",
      ownerControls: true,
      grantSites: ["rpn", "shop"],
    });
    expect(
      controlsFor(owner, person({ status: "disabled" }), sites).status,
    ).toBe("activate");
  });

  it("limits a site manager to their sites and to unprotected people", () => {
    expect(controlsFor(rpnManager, person(), sites)).toEqual({
      protected: false,
      status: "disable",
      ownerControls: false,
      grantSites: ["rpn"],
    });
    expect(
      controlsFor(rpnManager, person({ status: "pending" }), sites).status,
    ).toBe("activate");
    expect(
      controlsFor(rpnManager, person({ status: "disabled" }), sites).status,
    ).toBeNull();
    // Someone with a role elsewhere: grants on rpn still editable, status not.
    const elsewhere = controlsFor(
      rpnManager,
      person({
        grants: [
          { site: "shop", role: "admin", grantedBy: null, grantedAt: "" },
        ],
      }),
      sites,
    );
    expect(elsewhere).toMatchObject({ status: null, grantSites: ["rpn"] });
  });

  it("makes owners, other managers and yourself read-only for managers", () => {
    const manager = person({
      permissions: [
        { key: "access.manage", site: null, grantedBy: null, grantedAt: "" },
      ],
    });
    for (const p of [
      person({ isOwner: true }),
      manager,
      person({ id: "me" }),
    ]) {
      expect(controlsFor(rpnManager, p, sites)).toEqual({
        protected: true,
        status: null,
        ownerControls: false,
        grantSites: [],
      });
    }
  });

  it("gives plain staff nothing", () => {
    expect(controlsFor(plain, person(), sites)).toMatchObject({
      protected: false,
      status: null,
      grantSites: [],
    });
  });
});
