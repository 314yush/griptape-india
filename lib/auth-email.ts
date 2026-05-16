import type { User } from "@supabase/supabase-js";

/** Deterministic pseudo-email Supabase accepts; .invalid is reserved (RFC). */
export function syntheticEmailFromE164(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return `${digits}@phone.invalid`;
}

/** Email for `applications.email`: real auth email or pseudo-email from SMS phone. */
export function applicationEmailFromAuthUser(user: User): string | null {
  if (user.email && user.email.trim().length > 0) {
    return user.email;
  }
  const meta = user.user_metadata?.phone_e164;
  const fromMeta = typeof meta === "string" && meta.length > 0 ? meta : null;
  const fromPhone =
    typeof user.phone === "string" && user.phone.length > 0 ? user.phone : null;
  const raw = fromMeta ?? fromPhone;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return syntheticEmailFromE164(raw);
}

export function emailLooksSynthetic(authEmail: string | null | undefined): boolean {
  return Boolean(authEmail?.endsWith("@phone.invalid"));
}
