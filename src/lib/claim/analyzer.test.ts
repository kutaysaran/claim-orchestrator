import { describe, expect, it } from "vitest";

import { analyzeMockDocument } from "@/lib/claim/analyzer";

describe("analyzeMockDocument", () => {
  it("accepts a strong filename match for the requested document", () => {
    const result = analyzeMockDocument(
      {
        name: "occupational-certificate.pdf",
        type: "application/pdf",
        size: 1024,
      },
      "Occupational Certificate",
    );

    expect(result.status).toBe("success");
    expect(result.message).toMatch(/validation passed/i);
  });

  it("accepts a supported extension even if the browser omits MIME type", () => {
    const result = analyzeMockDocument(
      {
        name: "occupational-certificate.pdf",
        type: "",
        size: 1024,
      },
      "Occupational Certificate",
    );

    expect(result.status).toBe("success");
  });

  it("flags partially matching filenames with clearer feedback", () => {
    const result = analyzeMockDocument(
      {
        name: "work-proof.pdf",
        type: "application/pdf",
        size: 1024,
      },
      "Occupational Certificate",
    );

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/partially matches/i);
  });
});
