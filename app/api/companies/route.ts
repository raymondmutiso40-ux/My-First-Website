import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ companies: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    primary_contact_name,
    primary_contact_phone,
    secondary_contact_name,
    secondary_contact_phone,
  } = body ?? {};

  if (!name || !primary_contact_phone) {
    return NextResponse.json(
      { error: "name and primary_contact_phone are required" },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name,
      primary_contact_name,
      primary_contact_phone,
      secondary_contact_name,
      secondary_contact_phone,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company: data }, { status: 201 });
}
