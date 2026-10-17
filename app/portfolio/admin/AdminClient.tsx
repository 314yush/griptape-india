"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { STAGES, type Stage } from "@/lib/portfolio/outcomes";

export type LearnerRow = {
  learner_id: string;
  full_name: string;
  cohort_id: number | null;
  cohort: string;
  pursuit: string | null;
  joined: string;
  entries: number;
  shipped: number;
  hours: number;
  level: string;
  skills: number;
  lastActive: string | null;
  needsReset: boolean;
};

export type RecentEntry = {
  id: string;
  title: string;
  stage: Stage;
  hours: number;
  created_at: string;
  learner_id: string;
  full_name: string;
  cohort_id: number | null;
};

const WEEK = 7 * 24 * 60 * 60 * 1000;

function ago(iso: string | null) {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function toCsv(rows: LearnerRow[]) {
  const head = ["Learner ID", "Name", "Cohort", "Pursuit", "Joined", "Entries", "Shipped", "Hours", "Level", "Skills", "Last active"];
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [head, ...rows.map((r) => [r.learner_id, r.full_name, r.cohort, r.pursuit, r.joined.slice(0, 10), r.entries, r.shipped, r.hours, r.level, r.skills, r.lastActive?.slice(0, 10) ?? ""])]
    .map((row) => row.map(q).join(","))
    .join("\n");
}

export default function AdminClient({
  learners,
  recent,
  cohorts,
}: {
  learners: LearnerRow[];
  recent: RecentEntry[];
  cohorts: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [cohort, setCohort] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "entries" | "name">("recent");
  const [resetting, setResetting] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const inCohort = (id: number | null) => cohort === "all" || id === cohort;
  const isActive = (r: LearnerRow) => Boolean(r.lastActive && Date.now() - new Date(r.lastActive).getTime() < WEEK);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = learners.filter((r) => inCohort(r.cohort_id) && (!s || r.full_name.toLowerCase().includes(s) || r.learner_id.toLowerCase().includes(s)));
    return [...list].sort((a, b) =>
      sort === "name"
        ? a.full_name.localeCompare(b.full_name)
        : sort === "entries"
          ? b.entries - a.entries
          : (b.lastActive ?? b.joined).localeCompare(a.lastActive ?? a.joined)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learners, cohort, search, sort]);

  const scoped = learners.filter((r) => inCohort(r.cohort_id));
  const stats = {
    learners: scoped.length,
    active: scoped.filter(isActive).length,
    noEntries: scoped.filter((r) => r.entries === 0).length,
    entries: scoped.reduce((n, r) => n + r.entries, 0),
    shipped: scoped.reduce((n, r) => n + r.shipped, 0),
    hours: Math.round(scoped.reduce((n, r) => n + r.hours, 0)),
  };

  async function reset(r: LearnerRow) {
    if (!confirm(`Reset ${r.full_name}'s password? They'll sign in with the cohort code and choose a new one.`)) return;
    setResetting(r.learner_id);
    const res = await fetch("/api/portfolio/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reset", learner_id: r.learner_id }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setResetting(null);
    setNotice(res?.ok ? `${r.full_name} can now sign in with the cohort code and choose a new password.` : data.error ?? "Reset failed.");
    if (res?.ok) router.refresh();
  }

  async function logout() {
    await fetch("/api/portfolio/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    router.refresh();
  }

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" }));
    a.download = `griptape-portfolio-learners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  return (
    <div className="gtp-admin">
      <div className="gtp-admin-head">
        <div>
          <p className="gtp-kicker">Staff view</p>
          <h1>Portfolio admin</h1>
        </div>
        <div className="gtp-toolbar">
          <button className="gtp-btn gtp-btn-ghost gtp-btn-sm" onClick={() => router.refresh()}>
            ↻ Refresh
          </button>
          <button className="gtp-btn gtp-btn-ghost gtp-btn-sm" onClick={download}>
            ⬇ CSV
          </button>
          <button className="gtp-btn gtp-btn-ink gtp-btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="gtp-admin-tabs" role="tablist">
        <button className={cohort === "all" ? "is-on" : ""} onClick={() => setCohort("all")}>
          All cohorts <span>{learners.length}</span>
        </button>
        {cohorts.map((c) => (
          <button key={c.id} className={cohort === c.id ? "is-on" : ""} onClick={() => setCohort(c.id)}>
            {c.name} <span>{learners.filter((r) => r.cohort_id === c.id).length}</span>
          </button>
        ))}
      </div>

      <div className="gtp-admin-stats">
        <Stat label="Signed up" value={stats.learners} />
        <Stat label="Active this week" value={stats.active} hint="added work in the last 7 days" />
        <Stat label="No entries yet" value={stats.noEntries} hint="signed up, nothing logged" />
        <Stat label="Entries" value={stats.entries} />
        <Stat label="Shipped" value={stats.shipped} />
        <Stat label="Hours logged" value={stats.hours} />
      </div>

      {notice ? (
        <p className="gtp-admin-notice" onClick={() => setNotice(null)}>
          {notice}
        </p>
      ) : null}

      <section className="gtp-card gtp-admin-section">
        <div className="gtp-admin-section-head">
          <h2>Learners</h2>
          <div className="gtp-admin-controls">
            <input placeholder="Search name or GT ID" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="recent">Most recent activity</option>
              <option value="entries">Most entries</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
        {rows.length ? (
          <div className="gtp-admin-table-wrap">
            <table className="gtp-admin-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Cohort</th>
                  <th>Entries</th>
                  <th>Hours</th>
                  <th>Level</th>
                  <th>Skills</th>
                  <th>Last active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.learner_id}>
                    <td>
                      <a href={`/portfolio/u/${r.learner_id}`} target="_blank">
                        <b>{r.full_name}</b>
                      </a>
                      <small>
                        {r.learner_id}
                        {r.pursuit ? ` · ${r.pursuit}` : ""}
                      </small>
                    </td>
                    <td>{r.cohort}</td>
                    <td>
                      {r.entries}
                      {r.shipped ? <small>{r.shipped} shipped</small> : null}
                    </td>
                    <td>{r.hours}</td>
                    <td>{r.level}</td>
                    <td>{r.skills}/6</td>
                    <td className={isActive(r) ? "is-active" : r.entries === 0 ? "is-idle" : ""}>{ago(r.lastActive)}</td>
                    <td>
                      {r.needsReset ? (
                        <small>Reset, waiting</small>
                      ) : (
                        <button className="gtp-link" disabled={resetting === r.learner_id} onClick={() => reset(r)}>
                          {resetting === r.learner_id ? "Resetting…" : "Reset password"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="gtp-muted">{learners.length ? "No learners match." : "No one has signed up yet. Share portfolio.griptapeindia.org/login with your cohorts."}</p>
        )}
      </section>

      <section className="gtp-card gtp-admin-section">
        <h2>Latest entries</h2>
        {recent.filter((e) => inCohort(e.cohort_id)).length ? (
          <ul className="gtp-admin-feed">
            {recent
              .filter((e) => inCohort(e.cohort_id))
              .map((e) => (
                <li key={e.id}>
                  <a href={`/portfolio/u/${e.learner_id}`} target="_blank">
                    <b>{e.full_name}</b>
                  </a>{" "}
                  added <i>{e.title}</i>
                  <small>
                    {STAGES[e.stage] ?? e.stage}
                    {e.hours ? ` · ${e.hours} h` : ""} · {ago(e.created_at)}
                  </small>
                </li>
              ))}
          </ul>
        ) : (
          <p className="gtp-muted">Nothing logged yet.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="gtp-admin-stat" title={hint}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
