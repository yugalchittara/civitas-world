"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IDKitRequestWidget,
  orbLegacy,
  type IDKitResult,
  type RpContext
} from "@worldcoin/idkit";
import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClientWorldIdEnvironment } from "@/lib/world-id-environment";

type WorldIdVerificationCardProps = {
  action: string;
  promptContext: string;
  profileId?: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  className?: string;
  compact?: boolean;
  initialVerified?: boolean;
};

type SignatureResponse = {
  app_id: string;
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
  eventId?: string;
};

type VerificationErrorResponse = {
  code?: string;
  error?: string;
  message?: string;
  actionableHint?: string;
};

export function WorldIdVerificationCard({
  action,
  promptContext,
  profileId,
  title = "Verify with World ID",
  description = "Proof of human can be added to the standalone demo without exposing private Civitas data.",
  buttonLabel = "Verify now",
  className,
  compact = false,
  initialVerified = false
}: WorldIdVerificationCardProps) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const worldIdEnvironment = getClientWorldIdEnvironment();

  useEffect(() => {
    let cancelled = false;

    async function trackShown() {
      try {
        const response = await fetch("/api/human-verification/event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action,
            promptContext,
            profileId,
            stage: "SHOWN"
          })
        });
        const payload = (await response.json().catch(() => null)) as { eventId?: string } | null;
        if (!cancelled && payload?.eventId) {
          setEventId(payload.eventId);
        }
      } catch {
        // Non-blocking analytics.
      }
    }

    void trackShown();

    return () => {
      cancelled = true;
    };
  }, [action, profileId, promptContext]);

  const statusTone = useMemo(() => {
    if (isVerified) return "border-[#C4D2C8] bg-[#E4EFE6] text-[#2F6B4F]";
    if (errorMessage) return "border-[#EEC7C0] bg-[#FBEAEA] text-[#8A3A32]";
    return "border-[var(--border)] bg-[var(--surface)] text-[var(--secondary-text)]";
  }, [errorMessage, isVerified]);

  async function openWidget() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/rp-signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          promptContext,
          profileId,
          eventId
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | (SignatureResponse & VerificationErrorResponse)
        | VerificationErrorResponse
        | null;
      if (!response.ok || !payload || !("signature" in payload)) {
        setErrorMessage(
          payload?.message ||
            payload?.error ||
            (payload?.code === "WORLD_ID_NOT_CONFIGURED"
              ? "World verification is not configured. Add WORLD_APP_ID, WORLD_RP_ID, and WORLD_SIGNING_KEY."
              : payload?.code === "WORLD_ID_ENVIRONMENT_INVALID"
                ? "World verification environment is invalid. Use staging or production."
                : "Unable to start World verification.")
        );
        setIsLoading(false);
        return;
      }

      setAppId(payload.app_id);
      setRpContext({
        rp_id: payload.rp_id,
        nonce: payload.nonce,
        created_at: payload.created_at,
        expires_at: payload.expires_at,
        signature: payload.signature
      });
      if (payload.eventId) setEventId(payload.eventId);
      setIsOpen(true);
    } catch {
      setErrorMessage("Unable to start World verification.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSuccess(result: IDKitResult) {
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        idkitResponse: result,
        action,
        promptContext,
        profileId,
        eventId
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          code?: string;
          message?: string;
          actionableHint?: string;
          humanVerification?: { isVerified?: boolean };
        }
      | null;

    if (!response.ok) {
      setErrorMessage(payload?.message || payload?.error || "Verification failed. Please retry.");
      return;
    }

    setIsVerified(Boolean(payload?.humanVerification?.isVerified));
    setErrorMessage(null);
  }

  return (
    <section className={`rounded-[1.5rem] border p-4 ${statusTone} ${className || ""}`.trim()} aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-current/20 bg-white/60 p-2">
          {isVerified ? <BadgeCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--primary-ink)]">{title}</p>
          {!compact ? <p className="mt-1 text-xs leading-5 opacity-90">{description}</p> : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={openWidget}
              disabled={isLoading || isVerified}
              className="h-9 px-3 text-xs"
              variant={isVerified ? "outline" : "default"}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Preparing...
                </span>
              ) : isVerified ? (
                "Verified"
              ) : (
                buttonLabel
              )}
            </Button>

            {errorMessage ? <span className="text-xs text-[#8A3A32]">{errorMessage}</span> : null}
          </div>
        </div>
      </div>

      {rpContext && appId ? (
        <IDKitRequestWidget
          open={isOpen}
          onOpenChange={setIsOpen}
          onSuccess={handleSuccess}
          onError={() => {
            setErrorMessage("Verification was cancelled or failed.");
            setIsOpen(false);
          }}
          app_id={appId as `app_${string}`}
          action={action}
          environment={worldIdEnvironment}
          rp_context={rpContext}
          allow_legacy_proofs={true}
          preset={orbLegacy({ signal: `civitas:${promptContext}` })}
        />
      ) : null}
    </section>
  );
}
