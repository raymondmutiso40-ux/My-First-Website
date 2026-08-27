import type { Urgency } from "@/lib/compliance";

const STYLES: Record<Urgency, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-300",
  amber: "bg-amber-100 text-amber-800 border-amber-300",
  red: "bg-red-100 text-red-800 border-red-300",
};

const LABELS: Record<Urgency, string> = {
  green: "OK",
  amber: "Due soon",
  red: "Urgent",
};

export default function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[urgency]}`}
    >
      {LABELS[urgency]}
    </span>
  );
}
