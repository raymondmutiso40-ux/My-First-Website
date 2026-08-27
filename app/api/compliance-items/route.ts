import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("compliance_items_with_urgency")
    .select("*")
    .order("days_remaining", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company_id, agency, license_type, reference_number, expiry_date, notes } =
    body ?? {};

  if (!company_id || !agency || !license_type || !expiry_date) {
    return NextResponse.json(
      { error: "company_id, agency, license_type and expiry_date are required" },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("compliance_items")
    .insert({
      company_id,
      agency,
      license_type,
      reference_number,
      expiry_date,
      notes,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}
