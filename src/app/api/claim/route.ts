import { NextResponse } from "next/server";

import { mockClaimData } from "@/lib/data/mock-claim";
import { claimResponseSchema } from "@/lib/schemas/claim";

export async function GET() {
  const payload = claimResponseSchema.parse(mockClaimData);

  return NextResponse.json(payload);
}
