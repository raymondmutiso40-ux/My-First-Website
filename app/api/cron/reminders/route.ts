import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { sendSms } from "@/lib/africastalking";
import {
  REMINDER_THRESHOLDS,
  ESCALATION_THRESHOLD_DAYS,
  buildReminderMessage,
} from "@/lib/compliance";

export const dynamic = "force-dynamic";

interface ComplianceItemRow {
  id: string;
  agency: string;
  license_type: string;
  reference_number: string | null;
  expiry_date: string;
  status: "active" | "renewed" | "lapsed";
  company_id: string;
  companies: {
    primary_contact_phone: string;
    secondary_contact_phone: string | null;
  } | null;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / msPerDay);
}

/**
 * Meant to be triggered once a day by a scheduler (Vercel Cron, in this
 * repo's vercel.json). Finds every active compliance item whose days-left
 * matches one of REMINDER_THRESHOLDS, sends an SMS if one hasn't already
 * gone out today for that item+threshold, and logs the result.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const today = new Date();

  const { data: items, error } = await supabase
    .from("compliance_items")
    .select(
      `id, agency, license_type, reference_number, expiry_date, status, company_id,
       companies ( primary_contact_phone, secondary_contact_phone )`
    )
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{
    complianceItemId: string;
    daysLeft: number;
    sentTo: string[];
    skipped?: string;
  }> = [];

  for (const item of (items ?? []) as unknown as ComplianceItemRow[]) {
    const expiry = new Date(item.expiry_date);
    const daysLeft = daysBetween(today, expiry);

    if (!REMINDER_THRESHOLDS.includes(daysLeft as (typeof REMINDER_THRESHOLDS)[number])) {
      continue;
    }

    if (!item.companies?.primary_contact_phone) {
      results.push({
        complianceItemId: item.id,
        daysLeft,
        sentTo: [],
        skipped: "No primary contact phone on file",
      });
      continue;
    }

    // Skip if we've already sent this exact item+threshold today
    // (the unique index in the migration also enforces this at the DB level).
    const startOfToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    ).toISOString();

    const { data: existing } = await supabase
      .from("reminder_log")
      .select("id")
      .eq("compliance_item_id", item.id)
      .eq("days_before_expiry", daysLeft)
      .gte("sent_at", startOfToday)
      .maybeSingle();

    if (existing) {
      results.push({
        complianceItemId: item.id,
        daysLeft,
        sentTo: [],
        skipped: "Already sent today",
      });
      continue;
    }

    const message = buildReminderMessage(
      {
        agency: item.agency,
        license_type: item.license_type,
        reference_number: item.reference_number,
        expiry_date: item.expiry_date,
      },
      daysLeft
    );

    const recipients = [item.companies.primary_contact_phone];
    if (daysLeft <= ESCALATION_THRESHOLD_DAYS && item.companies.secondary_contact_phone) {
      recipients.push(item.companies.secondary_contact_phone);
    }

    const sentTo: string[] = [];

    for (const phone of recipients) {
      const result = await sendSms(phone, message);

      await supabase.from("reminder_log").insert({
        compliance_item_id: item.id,
        days_before_expiry: daysLeft,
        sent_to: phone,
        message,
        provider_message_id: result.providerMessageId,
        provider_status: result.success
          ? result.providerStatus
          : `FAILED: ${result.error ?? result.providerStatus ?? "unknown"}`,
      });

      if (result.success) sentTo.push(phone);
    }

    results.push({ complianceItemId: item.id, daysLeft, sentTo });
  }

  return NextResponse.json({
    checkedAt: today.toISOString(),
    itemsProcessed: (items ?? []).length,
    remindersSent: results.filter((r) => r.sentTo.length > 0).length,
    results,
  });
}
