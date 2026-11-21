import { describe, expect, it } from "vitest";
import { isSecureOrigin, publicOrigin, readAuthConfig } from "./config";

const full: Record<string, string> = {
  ENTRA_TENANT_ID: "tenant",
  ENTRA_CLIENT_ID: "client",
  ENTRA_CLIENT_SECRET: "secret",
  ENTRA_API_SCOPE: "api://client/access_as_user",
  ADMIN_SESSION_SECRET: "x".repeat(44),
};
const env = (vars: Record<string, string>) => (name: string) => vars[name];

describe("auth config", () => {
  it("is configured only when every variable is set", () => {
    expect(readAuthConfig(env(full))?.apiScope).toBe(
      "api://client/access_as_user",
    );
    for (const key of Object.keys(full)) {
      expect(readAuthConfig(env({ ...full, [key]: "  " }))).toBeNull();
    }
  });

  it("refuses a short session secret", () => {
    expect(
      readAuthConfig(env({ ...full, ADMIN_SESSION_SECRET: "short" })),
    ).toBeNull();
  });

  it("prefers PUBLIC_ORIGIN over the request origin", () => {
    const url = new URL("http://10.0.0.5:3000/sites/rpn/");
    expect(
      publicOrigin(
        env({ PUBLIC_ORIGIN: "https://admin.oceanorentals.net/" }),
        url,
      ),
    ).toBe("https://admin.oceanorentals.net");
    expect(publicOrigin(env({}), new URL("http://localhost:5173/x"))).toBe(
      "http://localhost:5173",
    );
    expect(isSecureOrigin("https://admin.oceanorentals.net")).toBe(true);
    expect(isSecureOrigin("http://localhost:5173")).toBe(false);
  });
});
