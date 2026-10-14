import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { learnerEmail, nameKey } from "@/lib/portfolio/ids";

/**
 * Sign-in: cohort + full name + password.
 *
 * - Returning learner (password_set): `password` is their own password.
 * - First time, or after a staff reset: `password` must be the cohort code. We reply
 *   { needs_new_password: true }; the client asks them to choose a password and sends it
 *   back as `new_password` (with the cohort code again). That creates or updates the
 *   account and signs them in.
 *
 * Sets the Supabase session cookie on success.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cohortId = Number(body?.cohort_id);
  const fullName = String(body?.full_name ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const password = String(body?.password ?? "");
  const newPassword = typeof body?.new_password === "string" ? body.new_password : null;

  if (!Number.isInteger(cohortId) || cohortId < 1) return NextResponse.json({ error: "Pick your cohort." }, { status: 400 });
  if (fullName.split(" ").length < 2) return NextResponse.json({ error: "Please type your full name (first and last)." }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Enter your password." }, { status: 400 });

  const admin = createAdminClient();
  const key = nameKey(fullName);
  const { data: profile, error: findErr } = await admin
    .from("learner_profiles")
    .select("user_id, learner_id, password_set")
    .eq("cohort_id", cohortId)
    .eq("name_key", key)
    .maybeSingle();
  if (findErr) {
    console.error("[portfolio/signin] lookup", findErr);
    return NextResponse.json({ error: "Sign-in isn't working right now. Please try again soon." }, { status: 500 });
  }

  const session = createClient();

  // Returning learner with their own password
  if (profile?.password_set) {
    const { error } = await session.auth.signInWithPassword({ email: learnerEmail(profile.learner_id), password });
    if (error) {
      return NextResponse.json(
        { error: "That password isn't right. If you've forgotten it, ask your champion to reset it." },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  // First time (or reset): the cohort code is the key
  const { data: codeOk, error: codeErr } = await admin.rpc("check_cohort_password", { p_cohort: cohortId, p_password: password });
  if (codeErr) {
    console.error("[portfolio/signin] check_cohort_password", codeErr);
    return NextResponse.json({ error: "Sign-in isn't working right now. Please try again soon." }, { status: 500 });
  }
  if (!codeOk) {
    return NextResponse.json(
      {
        error: profile
          ? "Your password was reset. Use your cohort code to choose a new one."
          : "We couldn't find you in that cohort with that password. First time? Use your cohort code. Check your name is spelled the same way as before.",
      },
      { status: 401 }
    );
  }

  if (!newPassword) return NextResponse.json({ needs_new_password: true, is_new: !profile });
  if (newPassword.length < 8) return NextResponse.json({ error: "Your password needs at least 8 characters." }, { status: 400 });
  if (newPassword === password) return NextResponse.json({ error: "Pick a password that's different from the cohort code." }, { status: 400 });

  let learnerId = profile?.learner_id ?? null;
  if (profile) {
    const { error } = await admin.auth.admin.updateUserById(profile.user_id, { password: newPassword });
    if (error) {
      console.error("[portfolio/signin] updateUserById", error);
      return NextResponse.json({ error: "Couldn't save your password. Please try again." }, { status: 500 });
    }
    await admin.from("learner_profiles").update({ password_set: true }).eq("user_id", profile.user_id);
  } else {
    const [{ data: newId, error: idErr }, { data: cohort }] = await Promise.all([
      admin.rpc("gen_learner_id"),
      admin.from("cohorts").select("name").eq("id", cohortId).single(),
    ]);
    if (idErr || typeof newId !== "string") {
      console.error("[portfolio/signin] gen_learner_id", idErr);
      return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
    }
    learnerId = newId;
    const { data: user, error: userErr } = await admin.auth.admin.createUser({
      email: learnerEmail(newId),
      password: newPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, learner_id: newId, cohort_id: cohortId },
    });
    if (userErr || !user.user) {
      console.error("[portfolio/signin] createUser", userErr);
      return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
    }
    const { error: insErr } = await admin.from("learner_profiles").insert({
      user_id: user.user.id,
      learner_id: newId,
      full_name: fullName,
      name_key: key,
      cohort_id: cohortId,
      cohort: cohort?.name ?? `Cohort ${cohortId}`,
      password_set: true,
    });
    if (insErr) {
      await admin.auth.admin.deleteUser(user.user.id);
      console.error("[portfolio/signin] profile insert", insErr);
      return NextResponse.json({ error: "Couldn't create your portfolio. Please try again." }, { status: 500 });
    }
  }

  const { error: signInErr } = await session.auth.signInWithPassword({ email: learnerEmail(learnerId!), password: newPassword });
  if (signInErr) {
    console.error("[portfolio/signin] signIn after setup", signInErr);
    return NextResponse.json({ error: "Your password is saved, but signing in failed. Try signing in again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, created: !profile });
}
