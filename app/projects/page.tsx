import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { OUTCOME_BY_KEY, STAGES, formatDate, totalHours, type Entry } from "@/lib/portfolio/outcomes";

export const metadata: Metadata = {
  title: "Projects",
  description: "What Griptape learners are making: every project from their portfolios, in their own words.",
};

// New entries also trigger revalidatePath("/projects") from /api/portfolio/entries
export const revalidate = 300;

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
    console.error("[projects] load", err);
    return { learners: [] as Learner[], entries: [] as Entry[] };
  }
}

export default async function ProjectsPage({ searchParams }: { searchParams: { cohort?: string } }) {
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
        <h1>Projects</h1>
        <p className="gtp-lede">
          Young people across India picking one thing and making it real. Everything here comes straight from their
          portfolios, in their own words.
        </p>
        {projectCount ? (
          <p className="gtp-projects-count">
            {projectCount} {projectCount === 1 ? "project" : "projects"} by {shown.length} {shown.length === 1 ? "learner" : "learners"}
          </p>
        ) : null}
      </header>

      {cohorts.length > 1 ? (
        <div className="gtp-filter" role="navigation" aria-label="Filter by cohort">
          <Link href="/projects" className={!cohortFilter ? "on" : ""}>
            All
          </Link>
          {cohorts.map(([id, name]) => (
            <Link key={id} href={`/projects?cohort=${id}`} className={cohortFilter === id ? "on" : ""}>
              {name}
            </Link>
          ))}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="gtp-empty">
          <span className="mascot-img gtp-empty-mascot" aria-hidden />
          <h3>Projects are on their way</h3>
          <p>As learners add work to their portfolios, it shows up here.</p>
        </div>
      ) : (
        shown.map((l) => {
          const work = byLearner.get(l.user_id)!;
          return (
            <section key={l.user_id} className="gtp-learner-block">
              <div className="gtp-learner-head">
                <div>
                  <h2>{l.full_name}</h2>
                  <p>
                    {[l.cohort, l.pursuit].filter(Boolean).join(" · ")}
                    <span className="gtp-muted"> · {work.length} {work.length === 1 ? "project" : "projects"}, {Math.round(totalHours(work))}h</span>
                  </p>
                </div>
                <Link href={`/portfolio/u/${l.learner_id}`} className="gtp-btn gtp-btn-ghost gtp-btn-sm">
                  Full portfolio →
                </Link>
              </div>
              <div className="gtp-entries">
                {work.map((e) => (
                  <article key={e.id} className={`gtp-entry stage-${e.stage}`}>
                    <h3>{e.title}</h3>
                    <div className="gtp-tags">
                      {e.area ? <span className="gtp-tag area">{e.area}</span> : null}
                      <span className={`gtp-tag stage ${e.stage}`}>{STAGES[e.stage]}</span>
                    </div>
                    <div className="gtp-entry-meta">
                      <span>📅 {formatDate(e.entry_date)}</span>
                      <span className="gtp-hours">{Number(e.hours)}h</span>
                    </div>
                    <p className="gtp-entry-body">{e.what_i_did}</p>
                    {e.evidence_url ? (
                      <a className="gtp-evidence" href={e.evidence_url} target="_blank" rel="noopener noreferrer">
                        See the proof ↗
                      </a>
                    ) : null}
                    {e.outcomes?.length ? (
                      <div className="gtp-grew">
                        <div>
                          {e.outcomes.map((k) =>
                            OUTCOME_BY_KEY[k] ? (
                              <span key={k} className="gtp-grew-pill" style={{ background: OUTCOME_BY_KEY[k].color }}>
                                {OUTCOME_BY_KEY[k].name}
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
