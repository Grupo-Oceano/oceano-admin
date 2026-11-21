import { describe, expect, it } from "vitest";
import {
  chunkName,
  COOKIE_CHUNK_SIZE,
  joinChunks,
  seal,
  splitIntoChunks,
  unseal,
} from "./seal";

const SECRET = "test-secret-0123456789-abcdefghijklmnopqrstuvwxyz";
const now = Math.floor(Date.now() / 1000);

/** Roughly the size and alphabet of a real Entra access token. */
const fakeAccessToken = () => {
  const b64 = (n: number) =>
    Buffer.from(crypto.getRandomValues(new Uint8Array(n))).toString("base64url");
  return `${b64(60)}.${b64(900)}.${b64(256)}`;
};

describe("seal / unseal", () => {
  it("round-trips a session", async () => {
    const value = {
      v: 1,
      accessToken: fakeAccessToken(),
      exp: now + 3600,
      name: "Ana Ruiz",
      email: "ana@gooceano.com",
    };
    const sealed = await seal(value, SECRET, "admin-session");
    expect(sealed.split(".")).toHaveLength(5); // JWE compact
    expect(sealed).not.toContain("Ana");
    expect(await unseal(sealed, SECRET, "admin-session", now)).toEqual(value);
  });

  it("rejects a tampered ciphertext or tag", async () => {
    const sealed = await seal({ exp: now + 60, role: "staff" }, SECRET, "admin-session");
    const flip = (index: number) => {
      const parts = sealed.split(".");
      parts[index] = (parts[index][0] === "A" ? "B" : "A") + parts[index].slice(1);
      return parts.join(".");
    };
    expect(await unseal(flip(3), SECRET, "admin-session", now)).toBeNull();
    expect(await unseal(flip(4), SECRET, "admin-session", now)).toBeNull();
  });

  it("rejects the wrong secret, the wrong purpose, expiry and junk", async () => {
    const sealed = await seal({ exp: now + 60 }, SECRET, "admin-session");
    expect(await unseal(sealed, `${SECRET}x`, "admin-session", now)).toBeNull();
    expect(await unseal(sealed, SECRET, "admin-login", now)).toBeNull();
    expect(await unseal(sealed, SECRET, "admin-session", now + 60)).toBeNull();
    expect(await unseal("not-a-jwe", SECRET, "admin-session", now)).toBeNull();
    expect(await unseal(undefined, SECRET, "admin-session", now)).toBeNull();
  });

  it("keeps a realistic session within two cookies", async () => {
    const sealed = await seal(
      {
        v: 1,
        accessToken: fakeAccessToken(),
        exp: now + 3600,
        iat: now,
        name: "Ana",
        email: "a@gooceano.com",
        oid: crypto.randomUUID(),
      },
      SECRET,
      "admin-session",
    );
    expect(splitIntoChunks(sealed).length).toBeLessThanOrEqual(2);
  });
});

describe("cookie chunks", () => {
  it("splits and joins back in order", () => {
    const value = "x".repeat(COOKIE_CHUNK_SIZE * 2 + 10);
    const chunks = splitIntoChunks(value);
    expect(chunks).toHaveLength(3);
    const jar = new Map(chunks.map((c, i) => [chunkName("oa_session", i), c]));
    expect(joinChunks("oa_session", (n) => jar.get(n))).toBe(value);
    expect(chunkName("oa_session", 0)).toBe("oa_session");
    expect(chunkName("oa_session", 2)).toBe("oa_session.2");
  });

  it("refuses values that need more than three cookies", () => {
    expect(() => splitIntoChunks("x".repeat(COOKIE_CHUNK_SIZE * 3 + 1))).toThrow();
  });

  it("a missing first chunk reads as no cookie", () => {
    expect(joinChunks("oa_session", () => undefined)).toBeUndefined();
  });
});
