/**
 * Minimal Africa's Talking SMS client using `fetch` against the REST API
 * directly, rather than the official Node SDK.
 *
 * Why not the SDK: as of writing, the `africastalking` npm package pulls
 * in old, vulnerable versions of axios/joi/lodash (see `npm audit`) and
 * hasn't been updated to address them. The SMS send endpoint is a single
 * form-encoded POST, so calling it directly avoids that dependency chain
 * entirely and works on both the Node and Edge runtimes.
 *
 * Docs: https://developers.africastalking.com/docs/sms/sending
 */

export interface SendSmsResult {
  success: boolean;
  providerMessageId: string | null;
  providerStatus: string | null;
  raw?: unknown;
  error?: string;
}

interface AfricasTalkingRecipient {
  statusCode: number;
  number: string;
  status: string;
  cost?: string;
  messageId?: string;
}

interface AfricasTalkingSmsResponse {
  SMSMessageData?: {
    Message: string;
    Recipients: AfricasTalkingRecipient[];
  };
}

function getBaseUrl(): string {
  // The sandbox app uses a different host than production apps.
  return process.env.AT_USERNAME === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";
}

/**
 * Sends a single SMS via Africa's Talking and normalizes the response
 * so callers don't need to know the API's response shape.
 */
export async function sendSms(to: string, message: string): Promise<SendSmsResult> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  const from = process.env.AT_SENDER_ID;

  if (!apiKey || !username) {
    return {
      success: false,
      providerMessageId: null,
      providerStatus: null,
      error: "Missing AT_API_KEY or AT_USERNAME environment variables.",
    };
  }

  const params = new URLSearchParams({ username, to, message });
  if (from) params.set("from", from);

  try {
    const res = await fetch(getBaseUrl(), {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        providerMessageId: null,
        providerStatus: null,
        error: `AT API returned ${res.status}: ${text}`,
      };
    }

    const data = (await res.json()) as AfricasTalkingSmsResponse;
    const recipient = data.SMSMessageData?.Recipients?.[0];

    return {
      success: Boolean(recipient && recipient.status === "Success"),
      providerMessageId: recipient?.messageId ?? null,
      providerStatus: recipient?.status ?? null,
      raw: data,
    };
  } catch (err) {
    return {
      success: false,
      providerMessageId: null,
      providerStatus: null,
      error: err instanceof Error ? err.message : "Unknown error sending SMS",
    };
  }
}
