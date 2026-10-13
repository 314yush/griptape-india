import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { analyzePortfolio } from "@/lib/portfolio/auto";
import { STAGES, type Entry, type Profile } from "@/lib/portfolio/outcomes";

// Entry writes go through here (not straight to Supabase) so skills and the summary are
// always worked out by the server. The DB blocks learners from writing those columns.

const text = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};

function cleanDraft(b: Record<string, unknown>) {
  const title = text(b.title, 160);
  const what = text(b.what_i_did, 4000);
  const date = typeof b.entry_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.entry_date) ? b.entry_date : null;
  if (!title || !what || !date) return null;
  let evidence = text(b.evidence_url, 500);
  if (evidence && !/^https?:\/\//i.test(evidence)) evidence = `https://${evidence}`;
  return {
    title,
    what_i_did: what,
    entry_date: date,
    area: text(b.area, 80),
    stage: (typeof b.stage === "string" && b.stage in STAGES ? b.stage : "started") as Entry["stage"],
    hours: Math.min(2000, Math.max(0, Number(b.hours) || 0)),
    how_i_did_it: text(b.how_i_did_it, 4000),
    what_i_learned: text(b.what_i_learned, 4000),
    evidence_url: evidence,
  };
}

async function context() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const [{ data: profile }, { data: entries }] = await Promise.all([
    admin.from("learner_profiles").select("*").eq("user_id", user.id).single(),
    admin.from("portfolio_entries").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }),
  ]);
  if (!profile) return null;
  return { userId: user.id, admin, profile: profile as Profile, entries: (entries ?? []) as Entry[] };
}

async function save(request: NextRequest, mode: "create" | "update") {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const draft = cleanDraft(body);
  if (!draft) return NextResponse.json({ error: "Add a title, a date and what you did." }, { status: 400 });

  const id = mode === "update" ? request.nextUrl.searchParams.get("id") : crypto.randomUUID();
  if (!id || (mode === "update" && !ctx.entries.some((e) => e.id === id))) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  const pending: Entry = { ...draft, id, user_id: ctx.userId, outcomes: [] };
  const all = [...ctx.entries.filter((e) => e.id !== id), pending].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  const { skills, summary } = await analyzePortfolio(ctx.profile, all, id);

  const row = { ...draft, outcomes: skills };
  const q =
    mode === "create"
      ? ctx.admin.from("portfolio_entries").insert({ ...row, id, user_id: ctx.userId })
      : ctx.admin.from("portfolio_entries").update(row).eq("id", id).eq("user_id", ctx.userId);
  const { data: entry, error } = await q.select().single();
  if (error) {
    console.error("[portfolio/entries] save", error);
    return NextResponse.json({ error: "Couldn't save. Please try again." }, { status: 500 });
  }
  await ctx.admin.from("learner_profiles").update({ summary }).eq("user_id", ctx.userId);
  return NextResponse.json({ entry, summary });
}

export const POST = (req: NextRequest) => save(req, "create");
export const PATCH = (req: NextRequest) => save(req, "update");

export async function DELETE(request: NextRequest) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ctx.entries.some((e) => e.id === id)) return NextResponse.json({ error: "Entry not found." }, { status: 404 });

  const { error } = await ctx.admin.from("portfolio_entries").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return NextResponse.json({ error: "Couldn't delete. Please try again." }, { status: 500 });

  const rest = ctx.entries.filter((e) => e.id !== id);
  const { summary } = await analyzePortfolio(ctx.profile, rest, null);
  await ctx.admin.from("learner_profiles").update({ summary }).eq("user_id", ctx.userId);
  return NextResponse.json({ summary });
}
