import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { parseRenewedCommand } from "@/lib/compliance";

export const dynamic = "force-dynamic";

/**
 * Africa's Talking posts inbound SMS as application/x-www-form-urlencoded
 * with fields: from, to, text, date, id, linkId.
 * Docs: https://developers.africastalking.com/docs/sms/receiving
 *
 * Configure this URL as your "Callback URL" in the AT dashboard under
 * SMS > SMS Settings for your shortcode/sender.
 */
export async function POST(req: NextRequest) {
  // Optional shared-secret check via query param, e.g.
  // https://your-app.vercel.app/api/sms/inbound?secret=xxxx
  const secret = req.nextUrl.searchParams.get("secret");
  if (
    process.env.INBOUND_WEBHOOK_SECRET &&
    secret !== process.env.INBOUND_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  let from = "";
  let text = "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    from = body.from ?? "";
    text = body.text ?? "";
  } else {
    const form = await req.formData();
    from = String(form.get("from") ?? "");
    text = String(form.get("text") ?? "");
  }

  const supabase = getServiceSupabase();

  if (!from || !text) {
    return NextResponse.json({ error: "Missing from/text in payload" }, { status: 400 });
  }

  const command = parseRenewedCommand(text);

  if (!command) {
    await supabase.from("inbound_sms_log").insert({
      from_phone: from,
      raw_text: text,
      parsed_command: "UNKNOWN",
      parsed_reference: null,
      matched_compliance_item_id: null,
      result: "ignored",
    });

    // Africa's Talking just needs a 200 response; it does not require
    // a reply body for inbound SMS the way USSD does.
    return NextResponse.json({ status: "ignored" });
  }

  const { reference } = command;

  const { data: matchedItem } = await supabase
    .from("compliance_items")
    .select("id, reference_number, status")
    .ilike("reference_number", reference)
    .maybeSingle();

  if (!matchedItem) {
    await supabase.from("inbound_sms_log").insert({
      from_phone: from,
      raw_text: text,
      parsed_command: "RENEWED",
      parsed_reference: reference,
      matched_compliance_item_id: null,
      result: "not_found",
    });

    return NextResponse.json({ status: "reference_not_found", reference });
  }

  await supabase
    .from("compliance_items")
    .update({ status: "renewed" })
    .eq("id", matchedItem.id);

  await supabase.from("inbound_sms_log").insert({
    from_phone: from,
    raw_text: text,
    parsed_command: "RENEWED",
    parsed_reference: reference,
    matched_compliance_item_id: matchedItem.id,
    result: "renewed",
  });

  return NextResponse.json({ status: "renewed", complianceItemId: matchedItem.id });
}
