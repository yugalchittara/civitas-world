import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { WorldIdVerificationCard } from "@/components/human-verification/world-id-verification-card";
import { getUnifiedHumanVerificationSummary } from "@/lib/human-verification";

function statusTone(status: string) {
  if (status === "VERIFIED") return "border-[#C4D2C8] bg-[#E4EFE6] text-[#2F6B4F]";
  if (status === "PENDING") return "border-[#E6D6B8] bg-[#F7EDDB] text-[#7A5C1E]";
  if (status === "FAILED") return "border-[#EEC7C0] bg-[#FBEAEA] text-[#8A3A32]";
  return "border-[var(--border)] bg-[var(--soft-section)] text-[var(--secondary-text)]";
}

export default async function ReporterVerificationPage() {
  const humanVerification = await getUnifiedHumanVerificationSummary();
  const status = humanVerification.isVerified ? "VERIFIED" : "PENDING";

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="surface-card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-[var(--soft-section)] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--authority-sage)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">World ID</p>
                <h1 className="font-display text-2xl font-semibold text-[var(--primary-ink)]">Reporter verification</h1>
              </div>
            </div>
            <Link href="/" className="text-sm font-semibold text-[var(--authority-sage)] hover:text-[var(--dark-sage)]">
              Back home
            </Link>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8 lg:py-8">
          <section className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--amber-text)]">
              Structured verification
            </p>
            <h2 className="max-w-md text-4xl leading-[0.96] text-[var(--primary-ink)]">
              Verify identity without exposing it publicly.
            </h2>
            <p className="max-w-xl text-base leading-7 text-[var(--secondary-text)]">
              This public World-facing page demonstrates the human verification flow. It keeps the session and proof
              state local to this standalone repo.
            </p>

            <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${statusTone(status)}`}>
              Current status: {status.toLowerCase()}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-text)]">
                Summary
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--secondary-text)]">
                <p>Providers: {humanVerification.providers.join(", ") || "none yet"}</p>
                <p>Verified at: {humanVerification.verifiedAt ? new Date(humanVerification.verifiedAt).toLocaleString() : "not yet verified"}</p>
                <p>Records: {humanVerification.records.length}</p>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <WorldIdVerificationCard
              action="verify-civitas-human"
              promptContext="reporter_verification"
              title="Optional: add World ID human verification"
              description="The proof is verified through World and stored in a lightweight demo summary, not the private Civitas backend."
              buttonLabel="Verify with World ID"
            />

            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">
                What this demo proves
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--secondary-text)]">
                <li>• A user can request a World ID proof</li>
                <li>• The proof can be verified without any private Civitas backend</li>
                <li>• The result can update the local human verification summary</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
