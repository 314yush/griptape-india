import { isAuthError } from "@supabase/supabase-js";

export type PhoneAuthStep =
  | "signInWithOtp"
  | "verifyOtp"
  | "getUserAfterVerify";

/** Safe fields for dashboards — no OTP, no full tokens. */
export function formatAuthFailure(step: PhoneAuthStep, err: unknown): string {
  const p = payloadFromUnknown(err);
  const parts = [p.message];
  if (p.code) parts.push(`(${p.code})`);
  if (p.status !== undefined) parts.push(`HTTP ${p.status}`);
  return `${step}: ${parts.filter(Boolean).join(" ")}`;
}

export function payloadFromUnknown(err: unknown): {
  message: string;
  status?: number;
  code?: string;
  name?: string;
} {
  if (isAuthError(err)) {
    return {
      message: err.message,
      status: err.status,
      code: typeof err.code === "string" ? err.code : undefined,
      name: err.name,
    };
  }
  if (err instanceof Error) {
    return { message: err.message, name: err.name };
  }
  return { message: String(err) };
}

/** Browser + server-in-API-route safe: always logs, never logs secrets. */
export function logPhoneAuthFailure(
  step: PhoneAuthStep,
  err: unknown,
  context: Record<string, string | undefined> = {}
): void {
  const p = payloadFromUnknown(err);
  const line = {
    step,
    ...p,
    ...context,
  };
  console.error("[phone-auth]", line);
}
