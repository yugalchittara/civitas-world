import { NextResponse } from "next/server";
import { trackHumanVerificationEvent } from "@/lib/human-verification";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    promptContext?: string;
    stage?: string;
    provider?: string;
    profileId?: string;
    eventId?: string;
    metadata?: Record<string, unknown>;
  };

  const eventId = await trackHumanVerificationEvent({
    eventId: body.eventId,
    userId: "anonymous",
    profileId: String(body.profileId || "").trim() || null,
    provider: body.provider,
    action: body.action,
    promptContext: body.promptContext,
    stage: body.stage,
    metadata: body.metadata
  });

  return NextResponse.json({ success: true, eventId });
}
