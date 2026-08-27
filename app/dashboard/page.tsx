import { getServiceSupabase } from "@/lib/supabase";
import ComplianceTable, { ComplianceRow } from "@/components/ComplianceTable";

export const dynamic = "force-dynamic"; // always show live data, no static caching

async function getComplianceRows(): Promise<ComplianceRow[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("compliance_items_with_urgency")
    .select(
      "id, company_name, agency, license_type, reference_number, expiry_date, status, days_remaining, urgency"
    )
    .order("days_remaining", { ascending: true });

  if (error) {
    console.error("Failed to load compliance items:", error.message);
    return [];
  }

  return (data ?? []) as ComplianceRow[];
}

export default async function DashboardPage() {
  const rows = await getComplianceRows();

  const urgentCount = rows.filter((r) => r.urgency === "red").length;
  const dueSoonCount = rows.filter((r) => r.urgency === "amber").length;
  const okCount = rows.filter((r) => r.urgency === "green").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Kazi Ready</h1>
        <p className="mt-1 text-kazi-muted">
          Compliance deadline &amp; document expiry tracking for KEBS, NEMA, KRA
          and county licenses — reminders sent by SMS via Africa&apos;s Talking.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Urgent (≤7 days or lapsed)" value={urgentCount} tone="red" />
        <SummaryCard label="Due soon (≤30 days)" value={dueSoonCount} tone="amber" />
        <SummaryCard label="On track" value={okCount} tone="green" />
      </section>

      <ComplianceTable rows={rows} />

      <footer className="mt-10 text-sm text-kazi-muted">
        Reminders go out automatically at 30, 14, 3, and 0 days before expiry.
        Companies can reply <code className="rounded bg-slate-100 px-1">RENEWED &lt;reference&gt;</code>{" "}
        by SMS to mark an item complete.
      </footer>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "green";
}) {
  const toneClasses = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClasses}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}
