/**
 * Normalize user mobile input focused on Indian numbers (+91).
 * Accepts "+91xxxxxxxxxx", "91xxxxxxxxxx", or "xxxxxxxxxx" (10 digits starting 6–9).
 */
export function normalizeIndianPhone(input: string): {
  ok: true;
  e164: string;
} | {
  ok: false;
  error: string;
} {
  let s = input.trim().replace(/\s+/g, "");
  const digitsOnly = s.replace(/\D/g, "");

  let national = digitsOnly;

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    national = digitsOnly.slice(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    national = digitsOnly.slice(1);
  }

  if (national.length !== 10) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }

  if (!["6", "7", "8", "9"].includes(national[0] ?? "")) {
    return {
      ok: false,
      error: "Indian mobile numbers usually start with 6, 7, 8, or 9.",
    };
  }

  return { ok: true, e164: `+91${national}` };
}
