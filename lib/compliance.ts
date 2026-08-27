/**
 * Reminder thresholds, in days-before-expiry.
 * 0 = due today. Keep sorted descending for readability in logs/UI.
 */
export const REMINDER_THRESHOLDS = [30, 14, 3, 0] as const;
export type ReminderThreshold = (typeof REMINDER_THRESHOLDS)[number];

/** Below this many days remaining, the secondary contact is also notified. */
export const ESCALATION_THRESHOLD_DAYS = 3;

export interface ComplianceItemForMessage {
  agency: string;
  license_type: string;
  reference_number: string | null;
  expiry_date: string; // ISO date string, e.g. '2026-09-15'
}

/**
 * Builds the outbound SMS copy for a reminder.
 * Kept as a pure function so it's trivially unit-testable and reusable
 * from both the cron route and any manual "resend" admin action later.
 */
export function buildReminderMessage(
  item: ComplianceItemForMessage,
  daysLeft: number
): string {
  const ref = item.reference_number ? ` Ref: ${item.reference_number}.` : "";

  if (daysLeft <= 0) {
    return (
      `URGENT: Your ${item.license_type} (${item.agency}) expires TODAY ` +
      `(${item.expiry_date}).${ref} Renew immediately to avoid penalties. ` +
      `Reply RENEWED <ref> once done.`
    );
  }

  return (
    `Reminder: Your ${item.license_type} (${item.agency}) expires in ` +
    `${daysLeft} day${daysLeft === 1 ? "" : "s"} on ${item.expiry_date}.${ref} ` +
    `Reply RENEWED <ref> once done.`
  );
}

export type Urgency = "green" | "amber" | "red";

/** Mirrors the SQL urgency logic in compliance_items_with_urgency for any
 *  client-side calculations that shouldn't wait on a round trip. */
export function computeUrgency(
  status: "active" | "renewed" | "lapsed",
  daysRemaining: number
): Urgency {
  if (status === "renewed") return "green";
  if (status === "lapsed" || daysRemaining < 0) return "red";
  if (daysRemaining <= 7) return "red";
  if (daysRemaining <= 30) return "amber";
  return "green";
}

/**
 * Parses inbound SMS text for the "RENEWED <reference>" command.
 * Case-insensitive, tolerates extra whitespace.
 * Returns null if the text doesn't match the expected command shape.
 */
export function parseRenewedCommand(text: string): { reference: string } | null {
  const trimmed = text.trim();
  const match = trimmed.match(/^RENEWED\s+(.+)$/i);
  if (!match) return null;

  const reference = match[1].trim();
  if (!reference) return null;

  return { reference };
}
