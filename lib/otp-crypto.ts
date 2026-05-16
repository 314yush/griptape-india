import { createHash, randomInt, timingSafeEqual } from "crypto";

export function generateNumericOtp(digits = 6): string {
  const upper = 10 ** digits;
  const n = randomInt(0, upper);
  return String(n).padStart(digits, "0");
}

export function otpPepperedHash(
  otp: string,
  phoneE164: string,
  pepper: string
): string {
  return createHash("sha256").update(pepper).update(":").update(phoneE164).update(":").update(otp).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
