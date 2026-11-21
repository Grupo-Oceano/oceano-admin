import { describe, expect, it } from "vitest";
import { SITE_TOKEN_SKEW_MS, SiteTokenCache } from "./site-token-cache";

const T0 = Date.parse("2026-11-20T12:00:00Z");
const token = (minutes: number, name = "t") => ({
  token: name,
  expiresAt: new Date(T0 + minutes * 60_000).toISOString(),
});

describe("SiteTokenCache", () => {
  it("serves a token until 60 s before it expires", () => {
    let now = T0;
    const cache = new SiteTokenCache(() => now);
    cache.set("staff-1", "rpn", token(10));
    expect(cache.get("staff-1", "rpn")?.token).toBe("t");
    now = T0 + 10 * 60_000 - SITE_TOKEN_SKEW_MS - 1;
    expect(cache.get("staff-1", "rpn")?.token).toBe("t");
    now += 1;
    expect(cache.get("staff-1", "rpn")).toBeUndefined();
  });

  it("keys by staff and site", () => {
    const cache = new SiteTokenCache(() => T0);
    cache.set("staff-1", "rpn", token(10, "a"));
    expect(cache.get("staff-2", "rpn")).toBeUndefined();
    expect(cache.get("staff-1", "blog")).toBeUndefined();
  });

  it("does not store tokens already inside the skew, or with a bad date", () => {
    const cache = new SiteTokenCache(() => T0);
    cache.set("s", "rpn", token(0.5));
    cache.set("s", "blog", { token: "x", expiresAt: "soon" });
    expect(cache.get("s", "rpn")).toBeUndefined();
    expect(cache.get("s", "blog")).toBeUndefined();
  });

  it("drops one site or every site of a staff member", () => {
    const cache = new SiteTokenCache(() => T0);
    cache.set("s", "rpn", token(10));
    cache.set("s", "blog", token(10));
    cache.delete("s", "rpn");
    expect(cache.get("s", "rpn")).toBeUndefined();
    expect(cache.get("s", "blog")).toBeDefined();
    cache.delete("s");
    expect(cache.get("s", "blog")).toBeUndefined();
  });

  it("shares one in-flight fetch per (staff, site)", async () => {
    const cache = new SiteTokenCache(() => T0);
    let calls = 0;
    const fetch = async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      return calls;
    };
    const [a, b] = await Promise.all([
      cache.shared("s", "rpn", fetch),
      cache.shared("s", "rpn", fetch),
    ]);
    expect([a, b, calls]).toEqual([1, 1, 1]);
    await cache.shared("s", "rpn", fetch);
    expect(calls).toBe(2);
  });
});
