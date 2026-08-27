const DOCUMENTS = [
  {
    agency: "KEBS",
    label: "Product Standards Mark",
    ref: "KEBS-PS-2024-1182",
    days: "Expired 4 days ago",
    tone: "red",
    rotate: "-6deg",
    top: "2%",
    left: "4%",
  },
  {
    agency: "NEMA",
    label: "EIA Licence",
    ref: "NEMA-EIA-2024-8817",
    days: "3 days left",
    tone: "red",
    rotate: "4deg",
    top: "18%",
    left: "56%",
  },
  {
    agency: "KRA",
    label: "Tax Compliance Cert.",
    ref: "KRA-TCC-2026-0410",
    days: "14 days left",
    tone: "amber",
    rotate: "-3deg",
    top: "42%",
    left: "22%",
  },
  {
    agency: "County",
    label: "Single Business Permit",
    ref: "NBI-SBP-2026-3325",
    days: "30 days left",
    tone: "amber",
    rotate: "7deg",
    top: "8%",
    left: "76%",
  },
  {
    agency: "DOSH",
    label: "Workplace Safety Cert.",
    ref: "DOSH-WSC-2025-9012",
    days: "Renewed",
    tone: "green",
    rotate: "-8deg",
    top: "62%",
    left: "6%",
  },
  {
    agency: "NEMA",
    label: "Effluent Discharge Permit",
    ref: "NEMA-EDP-2024-2207",
    days: "Expired 11 days ago",
    tone: "red",
    rotate: "5deg",
    top: "60%",
    left: "58%",
  },
  {
    agency: "KRA",
    label: "PIN Certificate Renewal",
    ref: "KRA-PIN-2026-7734",
    days: "21 days left",
    tone: "amber",
    rotate: "-4deg",
    top: "36%",
    left: "68%",
  },
] as const;

const TONE_STYLES: Record<(typeof DOCUMENTS)[number]["tone"], string> = {
  red: "border-t-stamp-red",
  amber: "border-t-stamp-amber",
  green: "border-t-stamp-green",
};

const TONE_TEXT: Record<(typeof DOCUMENTS)[number]["tone"], string> = {
  red: "text-stamp-red",
  amber: "text-stamp-amber",
  green: "text-stamp-green",
};

export default function DocumentPinboard() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-3xl sm:h-[460px]">
      {DOCUMENTS.map((doc) => (
        <div
          key={doc.ref}
          className={`absolute w-44 rounded-sm border-t-4 bg-stamp-paper p-3 shadow-[0_10px_24px_-8px_rgba(18,24,27,0.35)] transition-transform duration-300 hover:z-10 hover:-translate-y-1 hover:scale-105 sm:w-52 ${TONE_STYLES[doc.tone]}`}
          style={{
            top: doc.top,
            left: doc.left,
            transform: `rotate(${doc.rotate})`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-stamp-navy/60">
              {doc.agency}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                doc.tone === "red"
                  ? "bg-stamp-red"
                  : doc.tone === "amber"
                  ? "bg-stamp-amber"
                  : "bg-stamp-green"
              }`}
            />
          </div>
          <p className="mt-1 font-display text-sm font-medium text-stamp-navy">
            {doc.label}
          </p>
          <p className="mt-2 font-mono text-[11px] text-stamp-navy/70">
            {doc.ref}
          </p>
          <p
            className={`mt-1 font-mono text-[11px] font-medium ${TONE_TEXT[doc.tone]}`}
          >
            {doc.days}
          </p>
        </div>
      ))}
    </div>
  );
}
