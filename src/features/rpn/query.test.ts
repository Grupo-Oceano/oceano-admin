import { describe, expect, it } from "vitest";
import { approveRequestInput, linkEscapiaInput, rejectRequestInput } from "./contract";
import {
  escapiaQueueHref,
  escapiaQueueQuery,
  reviewQueueApiQuery,
  reviewQueueHref,
  reviewQueueQuery,
} from "./query";
import { describeSnapshot, requestedStrategyOf } from "./snapshot";

const ID = "0b9a3c3e-1f2a-4c1d-9e1f-1234567890ab";

describe("review queue query", () => {
  it("defaults and drops unknown values", () => {
    expect(reviewQueueQuery.parse({})).toEqual({ status: "open", subject: "", cursor: "" });
    expect(reviewQueueQuery.parse({ status: "x", subject: "y", cursor: "../evil" })).toEqual({
      status: "open",
      subject: "",
      cursor: "",
    });
  });

  it("keeps valid values and lowercases the cursor", () => {
    expect(
      reviewQueueQuery.parse({ status: "approved", subject: "listing", cursor: ID.toUpperCase() }),
    ).toEqual({ status: "approved", subject: "listing", cursor: ID });
  });

  it("builds canonical hrefs and the API query", () => {
    expect(reviewQueueHref({ status: "open" })).toBe("/sites/rpn/");
    expect(reviewQueueHref({ status: "rejected", subject: "partner", cursor: ID })).toBe(
      `/sites/rpn/?status=rejected&subject=partner&cursor=${ID}`,
    );
    expect(reviewQueueApiQuery({ status: "open", subject: "", cursor: "" })).toEqual({
      status: "open",
      subject: undefined,
      cursor: undefined,
      limit: 25,
    });
  });
});

describe("escapia queue query", () => {
  it("accepts only the API's assignee filters", () => {
    expect(escapiaQueueQuery.parse({ assignee: "me" })).toEqual({ assignee: "me" });
    expect(escapiaQueueQuery.parse({ assignee: "everyone" })).toEqual({ assignee: "" });
    expect(escapiaQueueHref({ assignee: "unassigned" })).toBe(
      "/sites/rpn/escapia/?assignee=unassigned",
    );
    expect(escapiaQueueHref({})).toBe("/sites/rpn/escapia/");
  });
});

describe("decision inputs", () => {
  it("approve: notes and strategy are optional; blanks drop out", () => {
    expect(approveRequestInput.parse({ id: ID, reviewNotes: "  ", strategy: "" })).toEqual({
      id: ID,
      reviewNotes: undefined,
      strategy: undefined,
    });
    expect(approveRequestInput.parse({ id: ID, strategy: "oceano_managed" }).strategy).toBe(
      "oceano_managed",
    );
    expect(approveRequestInput.safeParse({ id: ID, strategy: "both" }).success).toBe(false);
  });

  it("reject: notes need 3+ characters after trimming", () => {
    expect(rejectRequestInput.safeParse({ id: ID, reviewNotes: " ab " }).success).toBe(false);
    expect(rejectRequestInput.parse({ id: ID, reviewNotes: " Fix photos " }).reviewNotes).toBe(
      "Fix photos",
    );
  });

  it("link-escapia: job-id-safe unit ids only", () => {
    expect(linkEscapiaInput.parse({ listingId: ID, escapiaUnitId: " U-123_a " }).escapiaUnitId).toBe(
      "U-123_a",
    );
    expect(linkEscapiaInput.safeParse({ listingId: ID, escapiaUnitId: "a:b" }).success).toBe(false);
    expect(linkEscapiaInput.safeParse({ listingId: "x", escapiaUnitId: "a" }).success).toBe(false);
  });
});

describe("snapshot", () => {
  it("lays out a company profile and falls back to raw JSON", () => {
    const company = {
      schemaVersion: 1,
      companyName: "Casa Sol",
      contactEmail: "a@b.mx",
    };
    expect(describeSnapshot("partner", company).kind).toBe("company");
    expect(describeSnapshot("partner", { ...company, schemaVersion: 2 }).kind).toBe("raw");
    expect(describeSnapshot("listing", company).kind).toBe("raw");
    expect(describeSnapshot("partner", null)).toEqual({ kind: "raw", json: "null" });
    expect(requestedStrategyOf({ requestedStrategy: "self_managed" })).toBe("self_managed");
    expect(requestedStrategyOf({ requestedStrategy: "x" })).toBeUndefined();
  });
});
