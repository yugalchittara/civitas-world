"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MiniKit } from "@worldcoin/minikit-js";
import { ArrowRight, Globe2, LogOut, WalletCards } from "lucide-react";

type MiniUser = {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
};

type WalletAuthLike = {
  address: string;
  message: string;
  signature: string;
};

export default function MiniHomePage() {
  const [user, setUser] = useState<MiniUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInstalled = useMemo(() => MiniKit.isInstalled(), []);
  const worldAppId = String(process.env.NEXT_PUBLIC_WORLD_APP_ID || "").trim();
  const miniOpenUrl = useMemo(() => {
    if (!worldAppId) return null;
    try {
      return MiniKit.getMiniAppUrl(worldAppId, "/mini");
    } catch {
      return null;
    }
  }, [worldAppId]);

  const loadSession = useCallback(async () => {
    const response = await fetch("/api/mini-auth/me", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json().catch(() => null)) as { user?: MiniUser | null } | null;
    setUser(payload?.user || null);
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  async function connectWallet() {
    setBusy(true);
    setError(null);

    try {
      if (!isInstalled) {
        setError("Open this page inside World App to use MiniKit wallet auth.");
        return;
      }

      const nonceResponse = await fetch("/api/nonce", { cache: "no-store" });
      const noncePayload = (await nonceResponse.json().catch(() => null)) as { nonce?: string } | null;
      if (!nonceResponse.ok || !noncePayload?.nonce) {
        setError("Unable to generate SIWE nonce.");
        return;
      }

      const walletResult = await MiniKit.walletAuth({
        nonce: noncePayload.nonce,
        statement: "Sign in to Civitas World Demo"
      });

      const authPayload = walletResult?.data as WalletAuthLike | undefined;
      if (!authPayload?.address || !authPayload?.message || !authPayload?.signature) {
        setError("Wallet auth failed or was cancelled.");
        return;
      }

      const completeResponse = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ walletAuthResult: authPayload })
      });
      const completePayload = (await completeResponse.json().catch(() => null)) as
        | { error?: string; actionableHint?: string }
        | null;

      if (!completeResponse.ok) {
        setError(completePayload?.error || "Unable to complete wallet sign-in.");
        return;
      }

      await loadSession();
    } catch {
      setError("Unable to authenticate with MiniKit wallet auth.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/mini-auth/logout", { method: "POST" });
      setUser(null);
    } catch {
      setError("Unable to log out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="surface-card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-[var(--soft-section)] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--authority-sage)]">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">Civitas</p>
                <h1 className="font-display text-2xl font-semibold text-[var(--primary-ink)]">Mini App</h1>
              </div>
            </div>
            <Link href="/" className="text-sm font-semibold text-[var(--authority-sage)] hover:text-[var(--dark-sage)]">
              Back home
            </Link>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:px-8 lg:py-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--amber-text)]">
              <Globe2 className="h-3.5 w-3.5" />
              World App entry
            </p>
            <h2 className="mt-5 max-w-xl text-4xl leading-[0.95] text-[var(--primary-ink)] sm:text-5xl">
              Wallet sign-in for the public demo
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--secondary-text)]">
              This route uses MiniKit wallet auth and a simple cookie-backed session so the public demo stays
              standalone.
            </p>

            <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  readOnly
                  value="Search a person, company, or AI agent"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--muted-text)] outline-none"
                />
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={busy || !isInstalled}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--authority-sage)] px-5 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--dark-sage)] disabled:opacity-60"
                >
                  {busy ? "Connecting..." : "Connect with World Wallet"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-[var(--border)] bg-[var(--soft-section)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-text)]">
                  Start building your record before you need it.
                </div>
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={busy || !isInstalled}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary-ink)] transition hover:border-[var(--strong-border)]"
                >
                  Log an incident
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm font-medium text-[#8A3A32]">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/reporter-verification"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary-ink)] transition hover:border-[var(--strong-border)]"
              >
                Open World ID verification
              </Link>
            </div>
          </div>

          <div className="surface-card bg-[var(--soft-section)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">Session status</p>
            {user ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-sm font-semibold text-[var(--primary-ink)]">Signed in</p>
                <p className="text-sm text-[var(--secondary-text)]">Name: {user.name}</p>
                <p className="text-sm text-[var(--secondary-text)]">Wallet: {user.walletAddress}</p>
                <button
                  type="button"
                  onClick={logout}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary-ink)] transition hover:border-[var(--strong-border)]"
                >
                  <LogOut className="h-4 w-4" />
                  {busy ? "Please wait..." : "Log out"}
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--secondary-text)]">
                {isInstalled ? "MiniKit is available. You can connect a wallet and issue a demo session." : "Open inside World App to use the native MiniKit flow."}
                {!isInstalled && miniOpenUrl ? (
                  <p className="mt-2">
                    Open in World App:{" "}
                    <a className="font-semibold text-[var(--authority-sage)] underline" href={miniOpenUrl}>
                      launch mini app
                    </a>
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
