import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";
import {
  HUMAN_VERIFICATION_EVENT_STAGES,
  HUMAN_VERIFICATION_PROVIDERS,
  trackHumanVerificationEvent
} from "@/lib/human-verification";
import { getServerWorldIdEnvironment } from "@/lib/world-id-environment";

function getConfig() {
  const rpId = String(process.env.WORLD_RP_ID || "").trim();
  const appId = String(process.env.WORLD_APP_ID || "").trim();
  const signingKey = String(process.env.WORLD_SIGNING_KEY || process.env.RP_SIGNING_KEY || "").trim();

  if (!rpId || !appId || !signingKey) {
    return null;
  }

  return { rpId, appId, signingKey };
}

export async function POST(request: Request) {
  try {
    const config = getConfig();
    const worldEnvironment = getServerWorldIdEnvironment();

    if (!config) {
      const missing = [
        !process.env.WORLD_APP_ID ? "WORLD_APP_ID" : null,
        !process.env.WORLD_RP_ID ? "WORLD_RP_ID" : null,
        !(process.env.WORLD_SIGNING_KEY || process.env.RP_SIGNING_KEY) ? "WORLD_SIGNING_KEY" : null
      ].filter(Boolean);

      const hasEnvironmentMisconfiguration = !worldEnvironment.valid;

      return NextResponse.json(
        {
          code: hasEnvironmentMisconfiguration
            ? "WORLD_ID_ENVIRONMENT_INVALID"
            : "WORLD_ID_NOT_CONFIGURED",
          message: hasEnvironmentMisconfiguration
            ? `Invalid WORLD_ID_ENVIRONMENT "${worldEnvironment.rawValue}". Falling back to "${worldEnvironment.environment}".`
            : "World verification is not configured.",
          actionableHint: hasEnvironmentMisconfiguration
            ? "Set WORLD_ID_ENVIRONMENT to staging or production."
            : "Set WORLD_APP_ID, WORLD_RP_ID, and WORLD_SIGNING_KEY in .env.local.",
          error: "World verification is not configured.",
          missing,
          environment: worldEnvironment.environment
        },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      promptContext?: string;
      profileId?: string;
      eventId?: string;
      ttl?: number;
    };

    const action = String(body.action || "verify-civitas-human").trim() || "verify-civitas-human";
    const promptContext = String(body.promptContext || "general").trim() || "general";

    const ttl = Number.isFinite(body.ttl) ? Math.min(Math.max(Number(body.ttl), 60), 900) : undefined;

    const signature = signRequest({
      signingKeyHex: config.signingKey,
      action,
      ttl
    });

    const eventId = await trackHumanVerificationEvent({
      eventId: body.eventId,
      userId: "anonymous",
      profileId: String(body.profileId || "").trim() || null,
      provider: HUMAN_VERIFICATION_PROVIDERS.WORLD_ID,
      action,
      promptContext,
      stage: HUMAN_VERIFICATION_EVENT_STAGES.CLICKED,
      metadata: {
        source: "rp-signature",
        environment: worldEnvironment.environment,
        created_at: signature.createdAt,
        expires_at: signature.expiresAt
      }
    });

    return NextResponse.json({
      rp_id: config.rpId,
      app_id: config.appId,
      nonce: signature.nonce,
      created_at: signature.createdAt,
      expires_at: signature.expiresAt,
      signature: signature.sig,
      eventId,
      environment: worldEnvironment.environment
    });
  } catch (error) {
    console.error("[rp-signature] failed to generate signature", error);
    return NextResponse.json({ error: "Unable to generate RP signature." }, { status: 500 });
  }
}
