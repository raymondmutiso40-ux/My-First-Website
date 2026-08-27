"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface CompanyOption {
  id: string;
  name: string;
}

const AGENCIES = ["KEBS", "NEMA", "KRA", "County", "DOSH"] as const;

type Tab = "company" | "item";
type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string } | { kind: "success"; message: string };

export default function AddEntryForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(companies.length === 0 ? "company" : "item");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // company fields
  const [companyName, setCompanyName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");

  // compliance item fields
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [agency, setAgency] = useState<(typeof AGENCIES)[number]>("KRA");
  const [licenseType, setLicenseType] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  async function submitCompany(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          primary_contact_phone: primaryPhone,
          secondary_contact_phone: secondaryPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add company");

      setStatus({ kind: "success", message: `Added ${data.company.name}.` });
      setCompanyName("");
      setPrimaryPhone("");
      setSecondaryPhone("");
      setCompanyId(data.company.id);
      setTab("item");
      router.refresh();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  async function submitItem(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/compliance-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          agency,
          license_type: licenseType,
          reference_number: referenceNumber || undefined,
          expiry_date: expiryDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add compliance item");

      setStatus({
        kind: "success",
        message: `Added ${data.item.license_type} (expires ${data.item.expiry_date}).`,
      });
      setLicenseType("");
      setReferenceNumber("");
      setExpiryDate("");
      router.refresh();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 rounded-md bg-kazi-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        + Add company or compliance item
      </button>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <TabButton active={tab === "company"} onClick={() => setTab("company")}>
            Add company
          </TabButton>
          <TabButton
            active={tab === "item"}
            onClick={() => setTab("item")}
            disabled={companies.length === 0}
          >
            Add compliance item
          </TabButton>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-kazi-muted hover:text-kazi-ink"
        >
          Close
        </button>
      </div>

      {tab === "company" && (
        <form onSubmit={submitCompany} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="company-name">
            <input
              id="company-name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="e.g. Acme Manufacturers Ltd"
            />
          </Field>
          <Field label="Primary contact phone" htmlFor="primary-phone">
            <input
              id="primary-phone"
              required
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              className="input"
              placeholder="+2547XXXXXXXX"
            />
          </Field>
          <Field label="Secondary contact phone (optional)" htmlFor="secondary-phone">
            <input
              id="secondary-phone"
              value={secondaryPhone}
              onChange={(e) => setSecondaryPhone(e.target.value)}
              className="input"
              placeholder="+2547XXXXXXXX"
            />
          </Field>
          <div className="flex items-end sm:col-span-2">
            <SubmitButton status={status} label="Add company" />
          </div>
        </form>
      )}

      {tab === "item" && (
        <form onSubmit={submitItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="item-company">
            <select
              id="item-company"
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="input"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Agency" htmlFor="item-agency">
            <select
              id="item-agency"
              value={agency}
              onChange={(e) => setAgency(e.target.value as typeof agency)}
              className="input"
            >
              {AGENCIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
          <Field label="License / permit type" htmlFor="item-license">
            <input
              id="item-license"
              required
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              className="input"
              placeholder="e.g. Tax Compliance Certificate"
            />
          </Field>
          <Field label="Reference number (optional)" htmlFor="item-ref">
            <input
              id="item-ref"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="input"
              placeholder="e.g. KRA-TCC-2026-0410"
            />
          </Field>
          <Field label="Expiry date" htmlFor="item-expiry">
            <input
              id="item-expiry"
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="input"
            />
          </Field>
          <div className="flex items-end">
            <SubmitButton status={status} label="Add compliance item" />
          </div>
        </form>
      )}

      {status.kind === "success" && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {status.message}
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {status.message}
        </p>
      )}

      <style jsx global>{`
        .input {
          border-radius: 0.375rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          width: 100%;
        }
        .input:focus {
          outline: 2px solid rgb(15 23 42 / 0.4);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-kazi-ink text-white"
          : "bg-slate-100 text-kazi-muted hover:bg-slate-200"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      title={disabled ? "Add a company first" : undefined}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm">
      <span className="mb-1 block text-kazi-muted">{label}</span>
      {children}
    </label>
  );
}

function SubmitButton({ status, label }: { status: Status; label: string }) {
  const saving = status.kind === "saving";
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded-md bg-kazi-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {saving ? "Saving…" : label}
    </button>
  );
}
