import { describe, expect, it } from "vitest";
import {
  auditQuery,
  createStaffInput,
  permissionBody,
  permissionInput,
  putGrantInput,
  setOwnerInput,
  sortStaff,
  staffQuery,
  type StaffMember,
} from "./schema";

const ID = "0b9a3c3e-1f2a-4c1d-9e1f-1234567890ab";

describe("access schemas", () => {
  it("staff and audit queries default safely", () => {
    expect(staffQuery.parse({})).toEqual({ status: "" });
    expect(staffQuery.parse({ status: "pending" })).toEqual({
      status: "pending",
    });
    expect(staffQuery.parse({ status: "owner" })).toEqual({ status: "" });
    expect(auditQuery.parse({})).toEqual({ cursor: "", limit: 50 });
    expect(auditQuery.parse({ cursor: ID, limit: "500" })).toEqual({
      cursor: ID,
      limit: 50,
    });
    expect(auditQuery.parse({ cursor: "1 OR 1=1", limit: "20" })).toEqual({
      cursor: "",
      limit: 20,
    });
  });

  it("create staff normalizes the email", () => {
    expect(
      createStaffInput.parse({ email: " Ana@GoOceano.com ", name: " Ana " }),
    ).toEqual({
      email: "ana@gooceano.com",
      name: "Ana",
    });
    expect(
      createStaffInput.safeParse({ email: "nope", name: "Ana" }).success,
    ).toBe(false);
  });

  it("owner flag and grants come from form strings", () => {
    expect(setOwnerInput.parse({ id: ID, isOwner: "false" }).isOwner).toBe(
      false,
    );
    expect(setOwnerInput.safeParse({ id: ID, isOwner: "yes" }).success).toBe(
      false,
    );
    expect(
      putGrantInput.safeParse({ id: ID, site: "rpn", role: "moderator" })
        .success,
    ).toBe(true);
    expect(
      putGrantInput.safeParse({ id: ID, site: "RPN!", role: "admin" }).success,
    ).toBe(false);
  });

  it("sorts pending first", () => {
    const row = (name: string, status: StaffMember["status"]) =>
      ({ name, email: `${name}@x`, status }) as StaffMember;
    expect(
      sortStaff([
        row("b", "active"),
        row("z", "pending"),
        row("a", "disabled"),
        row("a", "active"),
      ]).map((r) => `${r.status}:${r.name}`),
    ).toEqual(["pending:z", "active:a", "active:b", "disabled:a"]);
  });

  it("permission forms use * for every site", () => {
    expect(
      permissionInput.safeParse({ id: ID, key: "access.manage", site: "*" })
        .success,
    ).toBe(true);
    expect(
      permissionInput.safeParse({ id: ID, key: "access.manage", site: "rpn" })
        .success,
    ).toBe(true);
    expect(
      permissionInput.safeParse({ id: ID, key: "access.manage", site: "**" })
        .success,
    ).toBe(false);
    expect(
      permissionInput.safeParse({ id: ID, key: "Access Manage", site: "rpn" })
        .success,
    ).toBe(false);
    expect(permissionBody("*")).toEqual({ site: null });
    expect(permissionBody("rpn")).toEqual({ site: "rpn" });
  });
});
