import { describe, expect, it } from "vitest";
import { TtlCache } from "./ttl-cache";

describe("TtlCache", () => {
  it("expires entries and caps its size", () => {
    let now = 0;
    const cache = new TtlCache<number>(2, () => now);
    cache.set("a", 1, 100);
    cache.set("b", 2, 200);
    cache.set("c", 3, 300); // full: drops the oldest ("a")
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
    now = 200;
    expect(cache.get("b")).toBeUndefined();
    cache.set("d", 4, 100); // already expired: ignored
    expect(cache.get("d")).toBeUndefined();
  });
});
