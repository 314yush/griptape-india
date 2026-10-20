import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/portfolio/admin";
import { badgeCount, outcomeProgress, totalHours, type Entry, type Profile } from "@/lib/portfolio/outcomes";
import AdminClient, { type LearnerRow, type RecentEntry } from "./AdminClient";
import AdminLogin from "./AdminLogin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff view", robots: { index: false } };

type FullProfile = Profile & { user_id: string; cohort_id: number | null; created_at: string; password_set: boolean };

export default async function AdminPage() {
  if (!isAdmin()) return <AdminLogin />;

  const admin = createAdminClient();
  const [{ data: profiles }, { data: entries }, { data: cohorts }] = await Promise.all([
    admin.from("learner_profiles").select("*").order("created_at", { ascending: false }),
    admin.from("portfolio_entries").select("*").order("created_at", { ascending: false }),
    admin.from("cohorts").select("id, name").order("id"),
  ]);

  const byUser = new Map<string, Entry[]>();
  for (const e of (entries as Entry[]) ?? []) {
    const list = byUser.get(e.user_id) ?? [];
    list.push(e);
    byUser.set(e.user_id, list);
  }

  const learners: LearnerRow[] = ((profiles as FullProfile[]) ?? []).map((p) => {
    const mine = byUser.get(p.user_id) ?? [];
    const lastActive = mine.reduce<string | null>((max, e) => {
      const t = (e as Entry & { created_at?: string }).created_at ?? e.entry_date;
      return !max || t > max ? t : max;
    }, null);
    const progress = outcomeProgress(mine);
    return {
      learner_id: p.learner_id,
      full_name: p.full_name,
      cohort_id: p.cohort_id,
      cohort: p.cohort ?? "",
      pursuit: p.pursuit,
      joined: p.created_at,
      entries: mine.length,
      shipped: mine.filter((e) => e.stage === "shipped").length,
      hours: totalHours(mine),
      badges: badgeCount(mine),
      skills: progress.filter((o) => o.count > 0).length,
      lastActive,
      needsReset: !p.password_set,
    };
  });

  const nameOf = new Map(((profiles as FullProfile[]) ?? []).map((p) => [p.user_id, p]));
  const recent: RecentEntry[] = ((entries as (Entry & { created_at: string })[]) ?? []).slice(0, 25).map((e) => {
    const p = nameOf.get(e.user_id);
    return {
      id: e.id,
      title: e.title,
      stage: e.stage,
      hours: Number(e.hours) || 0,
      created_at: e.created_at,
      learner_id: p?.learner_id ?? "",
      full_name: p?.full_name ?? "Unknown",
      cohort_id: p?.cohort_id ?? null,
    };
  });

  return <AdminClient learners={learners} recent={recent} cohorts={cohorts ?? []} />;
}
