import Link from "next/link";
import StampSignature from "@/components/StampSignature";
import DocumentPinboard from "@/components/DocumentPinboard";

const AGENCIES = [
  { code: "KEBS", name: "Product standards" },
  { code: "NEMA", name: "Environmental licenses" },
  { code: "KRA", name: "Tax compliance" },
  { code: "County", name: "Business permits" },
  { code: "DOSH", name: "Workplace safety" },
];

const STEPS = [
  {
    n: "01",
    title: "Register a licence",
    body: "Add an expiry date one at a time via the API, or bulk-import a CSV of everything you're already tracking on a spreadsheet.",
  },
  {
    n: "02",
    title: "The daily check runs",
    body: "Every active compliance item is checked against today's date — no dashboard visit required for this part to work.",
  },
  {
    n: "03",
    title: "SMS goes out",
    body: "At 30, 14, 3, and 0 days before expiry, a reminder reaches the responsible contact. Inside 3 days, the owner is CC'd too.",
  },
  {
    n: "04",
    title: "Reply RENEWED",
    body: "Text back RENEWED and the reference number. The item clears and the dashboard flips to green — no login needed.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-stamp-navy font-body text-stamp-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-12 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp-amber">
              Africa&apos;s Talking Open Hackathon — Manufacturing
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Every licence has a date stamped on it.
              <br />
              <span className="italic text-stamp-paper">
                Kazi Ready reads them.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-stamp-ivory/75">
              KEBS, NEMA, KRA, county and DOSH renewals rarely fall due on the
              same day, so they fall through the cracks instead. Kazi Ready
              tracks every expiry and sends the reminder by SMS — the one
              channel every manufacturer already checks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-sm bg-stamp-paper px-5 py-3 font-body text-sm font-semibold text-stamp-navy transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp-amber"
              >
                View the dashboard
              </Link>
              <a
                href="https://github.com/raymondmutiso40-ux/My-First-Website"
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-stamp-ivory/30 px-5 py-3 font-body text-sm font-semibold text-stamp-ivory transition-colors hover:border-stamp-ivory/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp-amber"
              >
                Source on GitHub
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto">
            <StampSignature />
            <p className="text-center font-mono text-[11px] text-stamp-ivory/50">
              hover or tap the stamp
            </p>
          </div>
        </div>
      </section>

      {/* Problem: document pinboard */}
      <section className="bg-stamp-paperDim bg-paper-grain px-6 py-20 text-stamp-navy">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp-navy/50">
            The actual problem
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            This is what &quot;compliance&quot; looks like on a shared drive.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stamp-navy/70">
            A scatter of licenses across five agencies, each on its own
            renewal cycle, tracked (if at all) by whoever happens to be
            handling it that quarter.
          </p>
        </div>
        <DocumentPinboard />
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-stamp-amber">
            How it works
          </p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold sm:text-4xl">
            One SMS number, used both ways.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-4">
                <span className="font-mono text-sm text-stamp-amber">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium text-stamp-paper">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stamp-ivory/70">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agencies */}
      <section className="border-y border-stamp-ivory/10 bg-stamp-navy px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-stamp-ivory/40">
            Every agency, one inbox
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {AGENCIES.map((a) => (
              <div key={a.code} className="text-center">
                <div className="font-display text-xl font-semibold text-stamp-paper">
                  {a.code}
                </div>
                <div className="font-mono text-[11px] text-stamp-ivory/50">
                  {a.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Built for the manufacturer who has never missed a delivery
            <span className="italic text-stamp-paper"> and shouldn&apos;t miss a renewal either.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-sm bg-stamp-paper px-6 py-3 font-body text-sm font-semibold text-stamp-navy transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp-amber"
            >
              Open the dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stamp-ivory/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center font-mono text-[11px] text-stamp-ivory/40 sm:flex-row sm:text-left">
          <p>Kazi Ready — Next.js, Supabase, Africa&apos;s Talking SMS.</p>
          <p>MIT licensed.</p>
        </div>
      </footer>
    </main>
  );
}
