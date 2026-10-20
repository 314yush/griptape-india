import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Badge from "../Badge";
import { badgeCount, outcomeProgress, projectLevel, totalHours, type Entry } from "@/lib/portfolio/outcomes";

export const metadata: Metadata = {
  title: "Student portfolios",
  description: "What Griptape learners are making: every learner's portfolio, their projects and the badges they've earned.",
};

// New entries also trigger revalidatePath("/portfolio/learners") from /api/portfolio/entries
export const revalidate = 60;

type Learner = {
  user_id: string;
  learner_id: string;
  full_name: string;
  pursuit: string | null;
  cohort: string | null;
  cohort_id: number | null;
};

async function load() {
  try {
    // Anonymous read: RLS only returns public portfolios
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const [{ data: learners, error: lErr }, { data: entries, error: eErr }] = await Promise.all([
      sb.from("learner_profiles").select("user_id, learner_id, full_name, pursuit, cohort, cohort_id").eq("is_public", true),
      sb.from("portfolio_entries").select("*").order("entry_date", { ascending: false }),
    ]);
    if (lErr || eErr) throw lErr ?? eErr;
    return { learners: (learners ?? []) as Learner[], entries: (entries ?? []) as Entry[] };
  } catch (err) {
    console.error("[learners] load", err);
    return { learners: [] as Learner[], entries: [] as Entry[] };
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export default async function LearnersPage({ searchParams }: { searchParams: { cohort?: string } }) {
  const { learners, entries } = await load();
  const cohortFilter = Number(searchParams.cohort) || null;

  const byLearner = new Map<string, Entry[]>();
  entries.forEach((e) => byLearner.set(e.user_id, [...(byLearner.get(e.user_id) ?? []), e]));

  const cohorts = [...new Map(learners.filter((l) => l.cohort_id).map((l) => [l.cohort_id!, l.cohort ?? `Cohort ${l.cohort_id}`])).entries()].sort(
    (a, b) => a[0] - b[0]
  );
  const shown = learners
    .filter((l) => byLearner.has(l.user_id) && (!cohortFilter || l.cohort_id === cohortFilter))
    // most recently active learners first
    .sort((a, b) => byLearner.get(b.user_id)![0].entry_date.localeCompare(byLearner.get(a.user_id)![0].entry_date));
  const projectCount = shown.reduce((n, l) => n + byLearner.get(l.user_id)!.length, 0);

  return (
    <div className="gtp-projects">
      <header className="gtp-projects-hero">
        <p className="gtp-kicker">Made by Griptape learners</p>
        <h1>Student portfolios</h1>
        <p className="gtp-lede">
          Young people across India picking one thing and making it real. Open any portfolio to see their projects, how
          they made them and the badges they've earned.
        </p>
        {projectCount ? (
          <p className="gtp-projects-count">
            {shown.length} {shown.length === 1 ? "learner" : "learners"} · {projectCount} {projectCount === 1 ? "project" : "projects"}
          </p>
        ) : null}
      </header>

      {cohorts.length > 1 ? (
        <div className="gtp-filter" role="navigation" aria-label="Filter by cohort">
          <Link href="/portfolio/learners" className={!cohortFilter ? "on" : ""}>
            All
          </Link>
          {cohorts.map(([id, name]) => (
            <Link key={id} href={`/portfolio/learners?cohort=${id}`} className={cohortFilter === id ? "on" : ""}>
              {name}
            </Link>
          ))}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="gtp-empty">
          <span className="mascot-img gtp-empty-mascot" aria-hidden />
          <h3>Portfolios are on their way</h3>
          <p>As learners add work to their portfolios, they show up here.</p>
        </div>
      ) : (
        <div className="gtp-learner-grid">
          {shown.map((l) => {
            const work = byLearner.get(l.user_id)!;
            const progress = outcomeProgress(work);
            const badges = badgeCount(work);
            const level = projectLevel(work).current!;
            return (
              <Link key={l.user_id} href={`/portfolio/u/${l.learner_id}`} className="gtp-learner-card">
                <div className="gtp-learner-card-head">
                  <span className="gtp-avatar gtp-avatar-sm">{initials(l.full_name)}</span>
                  <div>
                    <h2>{l.full_name}</h2>
                    <p>{[l.cohort, l.pursuit].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="gtp-learner-card-badges">
                  <Badge glyph={level.glyph} color={level.color} size={40} title={`Level ${level.level}: ${level.name}`} />
                  <span className="gtp-learner-card-sep" aria-hidden />
                  {progress.map((p) => (
                    <Badge
                      key={p.outcome.key}
                      glyph={p.outcome.key}
                      color={p.outcome.color}
                      tier={p.tier}
                      locked={p.tier === 0}
                      size={40}
                      title={`${p.outcome.name}${p.tierName ? ` · ${p.tierName}` : " · locked"}`}
                    />
                  ))}
                </div>
                <ul className="gtp-learner-card-work">
                  {work.slice(0, 3).map((e) => (
                    <li key={e.id}>{e.title}</li>
                  ))}
                  {work.length > 3 ? <li className="gtp-muted">+ {work.length - 3} more</li> : null}
                </ul>
                <p className="gtp-learner-card-level">
                  Level {level.level} · {level.name}
                </p>
                <div className="gtp-learner-card-foot">
                  <span>
                    <b>{work.length}</b> {work.length === 1 ? "project" : "projects"}
                  </span>
                  <span>
                    <b>{Math.round(totalHours(work))}</b> hours
                  </span>
                  <span>
                    <b>{badges}</b> {badges === 1 ? "badge" : "badges"}
                  </span>
                  <em>View →</em>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
