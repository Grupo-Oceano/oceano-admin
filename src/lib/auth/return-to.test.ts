import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETURN_TO,
  loginUrl,
  returnPathOf,
  sanitizeReturnTo,
} from "./return-to";

describe("sanitizeReturnTo", () => {
  it("keeps same-origin app paths, with sub-path and query", () => {
    for (const ok of [
      "/",
      "/access/",
      "/access/audit/?cursor=0b9a3c3e-1f2a-4c1d-9e1f-1234567890ab",
      "/sites/rpn/",
      "/sites/rpn/requests/0b9a3c3e-1f2a-4c1d-9e1f-1234567890ab/",
      "/sites/rpn/?status=approved&subject=listing",
      "/leads/?offset=10&take=25",
    ]) {
      expect(sanitizeReturnTo(ok)).toBe(ok);
    }
  });

  it("falls back for missing, absolute, protocol-relative, looping and odd values", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "access",
      "https://evil.example/access",
      "//evil.example/access",
      "/\\evil.example",
      "/\taccess",
      "/sites/../auth/login",
      "/sites/%2F%2Fevil.example",
      "/access#frag",
      "/access?next=\\evil",
      "/auth/login",
      "/auth/callback/?code=x",
      "/auth",
      `/access?${"a".repeat(600)}`,
      "javascript:alert(1)",
    ]) {
      expect(sanitizeReturnTo(bad)).toBe(DEFAULT_RETURN_TO);
    }
  });

  it("returnPathOf drops the router's internal params", () => {
    expect(
      returnPathOf(
        new URL("http://x/sites/rpn/?status=approved&qaction=abc&qloaders=1"),
      ),
    ).toBe("/sites/rpn/?status=approved");
    expect(returnPathOf(new URL("http://x/auth/sign-in/"))).toBe("/");
  });

  it("loginUrl encodes a sanitized returnTo", () => {
    expect(loginUrl("/sites/rpn/?status=rejected")).toBe(
      "/auth/login/?returnTo=%2Fsites%2Frpn%2F%3Fstatus%3Drejected",
    );
    expect(loginUrl("https://evil.example")).toBe("/auth/login/?returnTo=%2F");
  });
});
