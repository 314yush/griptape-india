import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { learnerEmail, nameKey } from "@/lib/portfolio/ids";

/**
 * Cohort sign-in: cohort + full name + the cohort's shared password.
 * First sign-in creates the learner's account and portfolio; after that the same
 * cohort + name opens the same portfolio. Sets the Supabase session cookie.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cohortId = Number(body?.cohort_id);
  const fullName = String(body?.full_name ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const password = String(body?.password ?? "");

  if (!Number.isInteger(cohortId) || cohortId < 1) return NextResponse.json({ error: "Pick your cohort." }, { status: 400 });
  if (fullName.split(" ").length < 2) return NextResponse.json({ error: "Please type your full name (first and last)." }, { status: 400 });

  const admin = createAdminClient();
  const { data: ok, error: checkErr } = await admin.rpc("check_cohort_password", { p_cohort: cohortId, p_password: password });
  if (checkErr) {
    console.error("[portfolio/signin] check_cohort_password", checkErr);
    return NextResponse.json({ error: "Sign-in isn't working right now. Please try again soon." }, { status: 500 });
  }
  if (!ok) return NextResponse.json({ error: "That password isn't right for this cohort." }, { status: 401 });

  const key = nameKey(fullName);
  let { data: profile } = await admin
    .from("learner_profiles")
    .select("user_id, learner_id")
    .eq("cohort_id", cohortId)
    .eq("name_key", key)
    .maybeSingle();
  let created = false;

  if (!profile) {
    const [{ data: learnerId, error: idErr }, { data: cohort }] = await Promise.all([
      admin.rpc("gen_learner_id"),
      admin.from("cohorts").select("name").eq("id", cohortId).single(),
    ]);
    if (idErr || typeof learnerId !== "string") {
      console.error("[portfolio/signin] gen_learner_id", idErr);
      return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
    }
    const { data: user, error: userErr } = await admin.auth.admin.createUser({
      email: learnerEmail(learnerId),
      password: randomBytes(24).toString("base64url"), // never used; sign-in is by cohort password
      email_confirm: true,
      user_metadata: { full_name: fullName, learner_id: learnerId, cohort_id: cohortId },
    });
    if (userErr || !user.user) {
      console.error("[portfolio/signin] createUser", userErr);
      return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
    }
    const { error: insErr } = await admin.from("learner_profiles").insert({
      user_id: user.user.id,
      learner_id: learnerId,
      full_name: fullName,
      name_key: key,
      cohort_id: cohortId,
      cohort: cohort?.name ?? `Cohort ${cohortId}`,
    });
    if (insErr) {
      await admin.auth.admin.deleteUser(user.user.id);
      console.error("[portfolio/signin] profile insert", insErr);
      return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
    }
    profile = { user_id: user.user.id, learner_id: learnerId };
    created = true;
  }

  // Mint a one-time login token server-side and exchange it for a session cookie
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: learnerEmail(profile.learner_id),
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkErr || !tokenHash) {
    console.error("[portfolio/signin] generateLink", linkErr);
    return NextResponse.json({ error: "Couldn't sign you in. Please try again." }, { status: 500 });
  }
  const { error: otpErr } = await createClient().auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (otpErr) {
    console.error("[portfolio/signin] verifyOtp", otpErr);
    return NextResponse.json({ error: "Couldn't sign you in. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ created, learner_id: profile.learner_id });
}
