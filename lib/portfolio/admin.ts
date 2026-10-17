import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Staff view of the portfolio (/portfolio/admin). One shared staff password in
// ADMIN_PASSWORD; signing in sets an httpOnly cookie derived from it, so changing
// the password signs everyone out.

export const ADMIN_COOKIE = "gt_admin";

export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("griptape-portfolio-admin-v1").digest("hex");
}

export function checkAdminPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdmin() {
  const token = adminToken();
  const got = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(token && got && got === token);
}
