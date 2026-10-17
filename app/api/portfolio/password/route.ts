import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { learnerEmail } from "@/lib/portfolio/ids";

/**
 * Change password for a signed-in learner: { current_password, new_password }.
 * The current password is checked by signing in with it again, then the server
 * sets the new one.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const current = String(body?.current_password ?? "");
  const next = String(body?.new_password ?? "");

  const session = createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  if (next.length < 8) return NextResponse.json({ error: "Your new password needs at least 8 characters." }, { status: 400 });
  if (next === current) return NextResponse.json({ error: "Pick a new password that's different from your current one." }, { status: 400 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("learner_profiles").select("learner_id").eq("user_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { error: checkErr } = await session.auth.signInWithPassword({ email: learnerEmail(profile.learner_id), password: current });
  if (checkErr) return NextResponse.json({ error: "Your current password isn't right." }, { status: 401 });

  const { error } = await admin.auth.admin.updateUserById(user.id, { password: next });
  if (error) {
    console.error("[portfolio/password] updateUserById", error);
    return NextResponse.json({ error: "Couldn't change your password. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
