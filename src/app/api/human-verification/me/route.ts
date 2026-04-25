import { NextResponse } from "next/server";
import { getUnifiedHumanVerificationSummary } from "@/lib/human-verification";

export async function GET() {
  const humanVerification = await getUnifiedHumanVerificationSummary();
  return NextResponse.json({ humanVerification });
}
