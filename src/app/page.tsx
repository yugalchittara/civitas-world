import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";

const pillars = [
  {
    title: "MiniKit wallet auth",
    description: "Sign into the public demo inside World App with a lightweight SIWE flow.",
    href: "/mini"
  },
  {
    title: "World ID verification",
    description: "Run proof-of-human verification and see the demo summary update.",
    href: "/reporter-verification"
  },
  {
    title: "Standalone and safe",
    description: "No private Civitas backend dependency, no internal admin flows, no private secrets.",
    href: null
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 text-[15px] text-[var(--secondary-text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="surface-card flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--soft-section)] text-[var(--authority-sage)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">Civitas</p>
              <p className="font-display text-xl font-semibold text-[var(--primary-ink)]">World Demo</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/mini" className="text-sm font-semibold text-[var(--secondary-text)] hover:text-[var(--primary-ink)]">
              Mini App
            </Link>
            <Link href="/reporter-verification" className="text-sm font-semibold text-[var(--secondary-text)] hover:text-[var(--primary-ink)]">
              World ID
            </Link>
          </div>
        </header>

        <section className="surface-card grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:px-10 lg:py-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--amber-text)]">
              <Sparkles className="h-3.5 w-3.5" />
              Public export
            </p>
            <h1 className="mt-5 max-w-xl text-4xl leading-[0.95] text-[var(--primary-ink)] sm:text-5xl lg:text-6xl">
              A standalone World-facing Civitas build
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--secondary-text)]">
              This public repo contains only the World App and MiniKit surface needed for the demo. It does not
              depend on the private Civitas backend, scoring engine, or internal admin workflows.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/mini"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--authority-sage)] px-4 py-3 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--dark-sage)]"
              >
                Open mini app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/reporter-verification"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--primary-ink)] transition hover:border-[var(--strong-border)]"
              >
                World ID verification
              </Link>
            </div>
          </div>

          <div className="surface-card bg-[var(--soft-section)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">Included surface</p>
            <div className="mt-4 space-y-3">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--primary-ink)]">{pillar.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-[var(--secondary-text)]">{pillar.description}</p>
                    </div>
                    {pillar.href ? (
                      <Link
                        href={pillar.href}
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--authority-sage)]"
                      >
                        Open
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">Repo boundary</p>
            <p className="mt-3 text-sm leading-6 text-[var(--secondary-text)]">
              Everything here is safe to publish and can be refreshed from a private allowlist. Internal Civitas code
              stays behind the export manifest.
            </p>
          </div>
          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-text)]">Safety check</p>
            <p className="mt-3 text-sm leading-6 text-[var(--secondary-text)]">
              Run the secrets scan before publishing to make sure no credentials or private environment values slipped
              in.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
