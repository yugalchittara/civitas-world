import { NextResponse } from "next/server";
import type { IDKitResult } from "@worldcoin/idkit";
import {
  HUMAN_VERIFICATION_EVENT_STAGES,
  HUMAN_VERIFICATION_PROVIDERS,
  isHumanVerificationSchemaMissingError,
  trackHumanVerificationEvent
} from "@/lib/human-verification";
import { getServerWorldIdEnvironment } from "@/lib/world-id-environment";

function extractNullifier(idkitResponse: IDKitResult, verifyResponse: any): string | null {
  const resultNullifier = String(verifyResponse?.nullifier || "").trim();
  if (resultNullifier) return resultNullifier;

  const successfulNullifier = Array.isArray(verifyResponse?.results)
    ? String(verifyResponse.results.find((result: any) => result?.success)?.nullifier || "").trim()
    : "";
  if (successfulNullifier) return successfulNullifier;

  if (Array.isArray((idkitResponse as any)?.responses)) {
    const fallback = String((idkitResponse as any).responses[0]?.nullifier || "").trim();
    if (fallback) return fallback;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const worldEnvironment = getServerWorldIdEnvironment();
    const worldRpId = String(process.env.WORLD_RP_ID || "").trim();
    if (!worldRpId) {
      return NextResponse.json(
        {
          code: "WORLD_ID_NOT_CONFIGURED",
          message: "World verification is not configured.",
          actionableHint: "Set WORLD_APP_ID, WORLD_RP_ID, and WORLD_SIGNING_KEY in .env.local.",
          error: "WORLD_RP_ID is not configured."
        },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      idkitResponse?: IDKitResult;
      action?: string;
      promptContext?: string;
      profileId?: string;
      eventId?: string;
    };

    const idkitResponse = body.idkitResponse;
    if (!idkitResponse || typeof idkitResponse !== "object") {
      return NextResponse.json({ error: "Missing idkitResponse payload." }, { status: 400 });
    }

    const action = String(body.action || "verify-civitas-human").trim() || "verify-civitas-human";
    const promptContext = String(body.promptContext || "general").trim() || "general";

    const verifyWorldResponse = await fetch(`https://developer.world.org/api/v4/verify/${worldRpId}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(idkitResponse),
      cache: "no-store"
    });

    const verifyPayload = await verifyWorldResponse.json().catch(() => null);

    if (!verifyWorldResponse.ok || !verifyPayload?.success) {
      await trackHumanVerificationEvent({
        eventId: body.eventId,
        userId: "anonymous",
        profileId: String(body.profileId || "").trim() || null,
        provider: HUMAN_VERIFICATION_PROVIDERS.WORLD_ID,
        action,
        promptContext,
        stage: HUMAN_VERIFICATION_EVENT_STAGES.FAILED,
        metadata: {
          status: verifyWorldResponse.status,
          environment: worldEnvironment.environment,
          verifyPayload
        }
      });

      return NextResponse.json(
        {
          error: "Verification failed.",
          detail: verifyPayload
        },
        { status: 400 }
      );
    }

    const nullifier = extractNullifier(idkitResponse, verifyPayload);
    if (!nullifier) {
      await trackHumanVerificationEvent({
        eventId: body.eventId,
        userId: "anonymous",
        profileId: String(body.profileId || "").trim() || null,
        provider: HUMAN_VERIFICATION_PROVIDERS.WORLD_ID,
        action,
        promptContext,
        stage: HUMAN_VERIFICATION_EVENT_STAGES.FAILED,
        metadata: {
          reason: "MISSING_NULLIFIER",
          environment: worldEnvironment.environment,
          verifyPayload
        }
      });
      return NextResponse.json({ error: "Verification payload missing nullifier." }, { status: 400 });
    }

    await trackHumanVerificationEvent({
      eventId: body.eventId,
      userId: "anonymous",
      profileId: String(body.profileId || "").trim() || null,
      provider: HUMAN_VERIFICATION_PROVIDERS.WORLD_ID,
      action,
      promptContext,
      stage: HUMAN_VERIFICATION_EVENT_STAGES.COMPLETED,
      metadata: {
        nullifier,
        environment: worldEnvironment.environment,
        verifyPayload
      }
    });

    const verifiedAt = new Date().toISOString();
    const humanVerification = {
      isVerified: true,
      providers: [HUMAN_VERIFICATION_PROVIDERS.WORLD_ID],
      verifiedAt,
      degraded: false,
      records: [
        {
          id: nullifier,
          provider: HUMAN_VERIFICATION_PROVIDERS.WORLD_ID,
          status: "VERIFIED",
          verifiedAt,
          metadata: {
            action,
            promptContext,
            environment: worldEnvironment.environment
          }
        }
      ]
    };

    return NextResponse.json({
      success: true,
      nullifier,
      humanVerification,
      environment: worldEnvironment.environment
    });
  } catch (error) {
    if (isHumanVerificationSchemaMissingError()) {
      return NextResponse.json(
        {
          code: "HUMAN_VERIFICATION_SCHEMA_MISSING",
          message: "Human verification unavailable.",
          actionableHint: "This public demo stores verification state locally in cookies."
        },
        { status: 503 }
      );
    }

    console.error("[verify-proof] verification flow failed", error);
    return NextResponse.json({ error: "Unable to verify proof." }, { status: 500 });
  }
}
