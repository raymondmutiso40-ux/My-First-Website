"use client";

import { useMemo, useState } from "react";
import UrgencyBadge from "./UrgencyBadge";
import type { Urgency } from "@/lib/compliance";

export interface ComplianceRow {
  id: string;
  company_name: string;
  agency: string;
  license_type: string;
  reference_number: string | null;
  expiry_date: string;
  status: "active" | "renewed" | "lapsed";
  days_remaining: number;
  urgency: Urgency;
}

const AGENCIES = ["All", "KEBS", "NEMA", "KRA", "County", "DOSH"] as const;

export default function ComplianceTable({ rows }: { rows: ComplianceRow[] }) {
  const [agencyFilter, setAgencyFilter] = useState<(typeof AGENCIES)[number]>("All");
  const [urgencyFilter, setUrgencyFilter] = useState<"All" | Urgency>("All");

  const filtered = useMemo(() => {
    return rows
      .filter((r) => agencyFilter === "All" || r.agency === agencyFilter)
      .filter((r) => urgencyFilter === "All" || r.urgency === urgencyFilter)
      .sort((a, b) => a.days_remaining - b.days_remaining);
  }, [rows, agencyFilter, urgencyFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-kazi-muted" htmlFor="agency">
            Agency
          </label>
          <select
            id="agency"
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value as typeof agencyFilter)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            {AGENCIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-kazi-muted" htmlFor="urgency">
            Status
          </label>
          <select
            id="urgency"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as typeof urgencyFilter)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="All">All</option>
            <option value="red">Urgent</option>
            <option value="amber">Due soon</option>
            <option value="green">OK</option>
          </select>
        </div>

        <span className="ml-auto text-sm text-kazi-muted">
          {filtered.length} item{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">Company</th>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">Agency</th>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">License</th>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">Reference</th>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">Expiry</th>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">Days left</th>
              <th className="px-4 py-3 text-left font-medium text-kazi-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{row.company_name}</td>
                <td className="px-4 py-3">{row.agency}</td>
                <td className="px-4 py-3">{row.license_type}</td>
                <td className="px-4 py-3 text-kazi-muted">
                  {row.reference_number ?? "—"}
                </td>
                <td className="px-4 py-3">{row.expiry_date}</td>
                <td className="px-4 py-3">
                  {row.status === "renewed" ? "—" : row.days_remaining}
                </td>
                <td className="px-4 py-3">
                  <UrgencyBadge urgency={row.urgency} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-kazi-muted">
                  No compliance items match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
