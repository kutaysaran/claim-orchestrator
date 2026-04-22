"use client";

import { claimResponseSchema, type ClaimResponse } from "@/lib/schemas/claim";

export async function fetchClaimData(): Promise<ClaimResponse> {
  const response = await fetch("/api/claim", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Claim data could not be loaded.");
  }

  const json = await response.json();

  return claimResponseSchema.parse(json);
}
