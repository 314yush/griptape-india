import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { learnerEmail } from "@/lib/portfolio/ids";

/** Creates the auth user + profile and hands back the new learner ID. The client then logs in with it. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const full_name = String(body?.full_name ?? "").trim().slice(0, 120);
  const password = String(body?.password ?? "");
  const pursuit = String(body?.pursuit ?? "").trim().slice(0, 200) || null;

  if (full_name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Your password needs at least 8 characters." }, { status: 400 });

  const admin = createAdminClient();
  const { data: learnerId, error: idErr } = await admin.rpc("gen_learner_id");
  if (idErr || typeof learnerId !== "string") {
    console.error("[portfolio/signup] gen_learner_id", idErr);
    return NextResponse.json({ error: "Couldn't create your ID. Please try again." }, { status: 500 });
  }

  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: learnerEmail(learnerId),
    password,
    email_confirm: true,
    user_metadata: { full_name, learner_id: learnerId },
  });
  if (userErr || !created.user) {
    console.error("[portfolio/signup] createUser", userErr);
    return NextResponse.json({ error: userErr?.message ?? "Couldn't create your account." }, { status: 400 });
  }

  const { error: profileErr } = await admin
    .from("learner_profiles")
    .insert({ user_id: created.user.id, learner_id: learnerId, full_name, pursuit });
  if (profileErr) {
    console.error("[portfolio/signup] profile insert", profileErr);
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ learner_id: learnerId });
}
