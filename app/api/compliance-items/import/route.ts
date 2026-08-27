import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Bulk import compliance items from CSV.
 *
 * Expected header row (case-insensitive):
 *   company_name,agency,license_type,reference_number,expiry_date
 *
 * expiry_date must be ISO format: YYYY-MM-DD
 *
 * company_name is matched case-insensitively against existing companies.
 * Unmatched company names are reported back and skipped — create the
 * company first via POST /api/companies, then re-import.
 *
 * Send as: POST with Content-Type: text/csv, raw CSV text as the body.
 * See supabase/seed/sample_import.csv for a template.
 */
export async function POST(req: NextRequest) {
  const csvText = await req.text();
  if (!csvText.trim()) {
    return NextResponse.json({ error: "Empty CSV body" }, { status: 400 });
  }

  const lines = csvText.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const required = ["company_name", "agency", "license_type", "expiry_date"];
  const missing = required.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `CSV missing required column(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const idx = {
    company_name: header.indexOf("company_name"),
    agency: header.indexOf("agency"),
    license_type: header.indexOf("license_type"),
    reference_number: header.indexOf("reference_number"),
    expiry_date: header.indexOf("expiry_date"),
  };

  const supabase = getServiceSupabase();

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");

  if (companiesError) {
    return NextResponse.json({ error: companiesError.message }, { status: 500 });
  }

  const nameToId = new Map(
    (companies ?? []).map((c) => [c.name.trim().toLowerCase(), c.id])
  );

  const toInsert: Array<{
    company_id: string;
    agency: string;
    license_type: string;
    reference_number: string | null;
    expiry_date: string;
  }> = [];
  const skipped: Array<{ row: number; reason: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    const cols = raw.split(",").map((c) => c.trim());
    const companyName = cols[idx.company_name];
    const companyId = nameToId.get(companyName?.toLowerCase());
    const expiryDate = cols[idx.expiry_date];

    if (!companyId) {
      skipped.push({ row: i + 1, reason: `Unknown company "${companyName}"` });
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate ?? "")) {
      skipped.push({ row: i + 1, reason: `Invalid expiry_date "${expiryDate}" (expected YYYY-MM-DD)` });
      continue;
    }

    toInsert.push({
      company_id: companyId,
      agency: cols[idx.agency],
      license_type: cols[idx.license_type],
      reference_number: idx.reference_number >= 0 ? cols[idx.reference_number] || null : null,
      expiry_date: expiryDate,
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const { data, error } = await supabase.from("compliance_items").insert(toInsert).select("id");
    if (error) {
      return NextResponse.json({ error: error.message, skipped }, { status: 500 });
    }
    inserted = data?.length ?? 0;
  }

  return NextResponse.json({ inserted, skipped });
}
