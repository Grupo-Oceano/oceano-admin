import { describe, expect, it } from "vitest";
import { accessErrorMessage } from "~/features/access/errors";
import { rpnErrorMessage } from "~/features/rpn/errors";
import { errorMessage } from "./errors";

describe("errorMessage", () => {
  const messages = { codes: { taken: "Taken." }, status: { 409: "Conflict." }, fallback: "Nope." };

  it("prefers the code, then the status, then common statuses, then the fallback", () => {
    expect(errorMessage({ status: 409, message: "taken" }, messages)).toBe("Taken.");
    expect(errorMessage({ status: 409, message: "other" }, messages)).toBe("Conflict.");
    expect(errorMessage({ status: 401, message: "x" }, messages)).toMatch(/session expired/);
    expect(errorMessage({ status: 500, message: "boom" }, messages)).toMatch(/unavailable/);
    expect(errorMessage({ status: 418, message: "teapot" }, messages)).toBe("Nope.");
  });

  it("never treats inherited keys as codes", () => {
    expect(errorMessage({ status: 400, message: "toString" }, messages)).toBe("Nope.");
  });
});

describe("access errors", () => {
  it("maps oceano-core access codes", () => {
    expect(accessErrorMessage({ status: 403, message: "cannot_disable_self" })).toBe(
      "You can't disable your own account.",
    );
    expect(accessErrorMessage({ status: 409, message: "last_owner" })).toMatch(/at least one owner/);
    expect(accessErrorMessage({ status: 409, message: "staff_exists" })).toMatch(/already/);
    expect(accessErrorMessage({ status: 400, message: "email_domain_not_allowed" })).toMatch(
      /@gooceano.com/,
    );
    expect(accessErrorMessage({ status: 400, message: "invalid_role" })).toMatch(/role/);
    expect(accessErrorMessage({ status: 400, message: "email must be an email" })).toMatch(
      /weren't accepted/,
    );
    expect(accessErrorMessage({ status: 502, message: "fetch failed" })).toMatch(/isn't responding/);
  });
});

describe("rpn errors", () => {
  it("maps RPN API and site-token codes", () => {
    expect(rpnErrorMessage({ status: 409, message: "already_reviewed" })).toMatch(/already decided/);
    expect(rpnErrorMessage({ status: 409, message: "escapia_unit_taken" })).toMatch(
      /already linked/,
    );
    expect(rpnErrorMessage({ status: 409, message: "something_new" })).toMatch(/changed/);
    expect(rpnErrorMessage({ status: 403, message: "no_site_access" })).toMatch(/chuck@gooceano.com/);
    expect(rpnErrorMessage({ status: 403, message: "Forbidden" })).toMatch(/role/);
    expect(rpnErrorMessage({ status: 503, message: "staff_auth_unconfigured" })).toMatch(
      /isn't set up/,
    );
    expect(rpnErrorMessage({ status: 503, message: "Service Unavailable" })).toMatch(
      /RockyPoint.net is unavailable/,
    );
    expect(rpnErrorMessage({ status: 503, message: "RPN_API_URL is not configured" })).toMatch(
      /RPN_API_URL/,
    );
  });
});
