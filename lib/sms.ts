type SendOutcome = { ok: true } | { ok: false; error: string };

/**
 * Send SMS via your provider’s HTTP endpoint (MSG91, Gupshup, Twilio,
 * Make.com bridge, etc.). Convention: POST JSON { "to", "text" }.
 * POST JSON { "to": "+91...", "text": "…" }
 *
 * SMS_HTTP_URL — webhook URL
 * SMS_HTTP_AUTH_HEADER — optional Bearer / API key
 * SMS_DEV_SKIP=true — log to server console instead of sending (local dev)
 */
export async function sendSmsText(
  toE164: string,
  text: string
): Promise<SendOutcome> {
  const skip = process.env.SMS_DEV_SKIP === "true";
  if (skip) {
    console.info(`[SMS_DEV_SKIP] → ${toE164}\n${text}`);
    return { ok: true };
  }

  const url = process.env.SMS_HTTP_URL?.trim();
  if (!url) {
    return {
      ok: false,
      error:
        "SMS is not configured (set SMS_HTTP_URL or SMS_DEV_SKIP=true for dev).",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = process.env.SMS_HTTP_AUTH_HEADER?.trim();
  if (auth) {
    headers.Authorization = auth.startsWith("Bearer ")
      ? auth
      : `Bearer ${auth}`;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ to: toE164, text }),
    });

    if (!res.ok) {
      const snippet = await res.text().catch(() => "");
      return {
        ok: false,
        error: `SMS upstream returned ${res.status}. ${snippet.slice(0, 200)}`,
      };
    }

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: msg };
  }
}
