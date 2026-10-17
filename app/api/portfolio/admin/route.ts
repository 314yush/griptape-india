import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, adminToken, checkAdminPassword, isAdmin } from "@/lib/portfolio/admin";

/**
 * Staff actions:
 *   { action: "login", password }      sign in to /portfolio/admin
 *   { action: "logout" }
 *   { action: "reset", learner_id }    learner signs in with the cohort code again and picks a new password
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "login") {
    if (!checkAdminPassword(String(body?.password ?? ""))) {
      return NextResponse.json({ error: "That isn't the staff password." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, adminToken()!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (!isAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  if (action === "reset") {
    const { data, error } = await createAdminClient().rpc("reset_learner_password", {
      p_learner_id: String(body?.learner_id ?? ""),
    });
    if (error || !data) {
      console.error("[portfolio/admin] reset", error);
      return NextResponse.json({ error: "Couldn't reset that password." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
