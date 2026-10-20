"use client";

import { useState, type ReactNode } from "react";
import Badge from "./Badge";
import {
  OUTCOME_BY_KEY,
  STAGES,
  milestones,
  formatDate,
  outcomeProgress,
  TIERS,
  summaryFor,
  totalHours,
  type Entry,
  type Profile,
} from "@/lib/portfolio/outcomes";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}


export default function ProfileView({
  profile,
  entries,
  toolbar,
  renderEntryActions,
  emptyState,
  summaryKey = 0,
}: {
  profile: Profile;
  entries: Entry[];
  toolbar?: ReactNode;
  renderEntryActions?: (entry: Entry) => ReactNode;
  emptyState?: ReactNode;
  /** Bump to replay the "just updated" highlight on the summary. */
  summaryKey?: number;
}) {
  const [tab, setTab] = useState<"work" | "badges">("work");
  const progress = outcomeProgress(entries);
  const marks = milestones(entries);
  const hours = Math.round(totalHours(entries));
  const earnedCount =
    progress.filter((p) => p.tier > 0).length +
    marks.filter((m) => m.earned).length;

  return (
    <>
      <div
        key={summaryKey}
        className={`gtp-summary gtp-summary-top${summaryKey ? " is-fresh" : ""}`}
      >
        <span className="gtp-summary-icon">✦</span>
        <div>
          {summaryKey ? (
            <small className="gtp-summary-tag">Updated just now</small>
          ) : null}
          <p>{profile.summary || summaryFor(profile, entries)}</p>
        </div>
      </div>
      <div className="gtp-profile">
        <aside className="gtp-side">
          <div className="gtp-card gtp-id-card">
            <div className="gtp-avatar">{initials(profile.full_name)}</div>
            <h1 className="gtp-name">{profile.full_name}</h1>
            <div className="gtp-id-chip" title="Your Griptape learner ID">
              {profile.learner_id}
            </div>
            {profile.pursuit ? (
              <p className="gtp-pursuit">
                <span>Chasing</span> {profile.pursuit}
              </p>
            ) : null}
            {profile.bio ? <p className="gtp-bio">{profile.bio}</p> : null}
            <ul className="gtp-meta">
              {profile.city ? <li>📍 {profile.city}</li> : null}
              {profile.cohort ? <li>🎒 {profile.cohort}</li> : null}
            </ul>

            <div className="gtp-stats">
              <div>
                <b>{hours}</b>
                <span>hours</span>
              </div>
              <div>
                <b>{earnedCount}</b>
                <span>badges</span>
              </div>
            </div>
          </div>

          <div className="gtp-card">
            <h3 className="gtp-side-title">Skills</h3>
            <div className="gtp-badge-mini">
              {progress.map((p) => (
                <div key={p.outcome.key} className="gtp-badge-mini-item">
                  <Badge
                    glyph={p.outcome.key}
                    color={p.outcome.color}
                    tier={p.tier}
                    locked={p.tier === 0}
                    size={58}
                    title={`${p.outcome.name}${p.tierName ? ` · ${p.tierName}` : " · locked"}`}
                  />
                  {p.count > 0 ? (
                    <span className="gtp-x">×{p.count}</span>
                  ) : null}
                  <span>{p.outcome.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="gtp-main">
          <div className="gtp-tabs-row">
            <div className="gtp-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === "work"}
                className={tab === "work" ? "on" : ""}
                onClick={() => setTab("work")}
              >
                {renderEntryActions ? "My work" : "Work"}
              </button>
              <button
                role="tab"
                aria-selected={tab === "badges"}
                className={tab === "badges" ? "on" : ""}
                onClick={() => setTab("badges")}
              >
                Badges <em>{earnedCount}</em>
              </button>
            </div>
            {toolbar}
          </div>

          {tab === "work" ? (
            entries.length === 0 ? (
              (emptyState ?? <div className="gtp-empty">No entries yet.</div>)
            ) : (
              <div className="gtp-entries">
                {entries.map((e) => (
                  <article key={e.id} className={`gtp-entry stage-${e.stage}`}>
                    <header>
                      <h3>{e.title}</h3>
                      {renderEntryActions ? (
                        <div className="gtp-entry-actions">
                          {renderEntryActions(e)}
                        </div>
                      ) : null}
                    </header>
                    <div className="gtp-tags">
                      {e.area ? (
                        <span className="gtp-tag area">{e.area}</span>
                      ) : null}
                      <span className={`gtp-tag stage ${e.stage}`}>
                        {STAGES[e.stage]}
                      </span>
                    </div>
                    <div className="gtp-entry-meta">
                      <span>📅 {formatDate(e.entry_date)}</span>
                      <span className="gtp-hours">{Number(e.hours)}h</span>
                    </div>
                    <p className="gtp-entry-body">{e.what_i_did}</p>
                    {e.how_i_did_it ? (
                      <div className="gtp-entry-sub">
                        <b>How I did it</b>
                        <p>{e.how_i_did_it}</p>
                      </div>
                    ) : null}
                    {e.what_i_learned ? (
                      <div className="gtp-entry-sub">
                        <b>What I learned</b>
                        <p>{e.what_i_learned}</p>
                      </div>
                    ) : null}
                    {e.evidence_url ? (
                      <a
                        className="gtp-evidence"
                        href={e.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        See the proof ↗
                      </a>
                    ) : null}
                    {e.outcomes?.length ? (
                      <div className="gtp-grew">
                        <small>Skills activated</small>
                        <div>
                          {e.outcomes.map((k) => {
                            const o = OUTCOME_BY_KEY[k];
                            return o ? (
                              <span
                                key={k}
                                className="gtp-grew-pill"
                                style={{ background: o.color }}
                              >
                                {o.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className="gtp-badge-board">
              <h3>Skill badges</h3>
              <p className="gtp-muted">
                Badges grow as your work shows the skill:{" "}
                {TIERS.map((t) => `${t.name} at ${t.at}`).join(", ")}.
              </p>
              <div className="gtp-badge-grid">
                {progress.map((p) => (
                  <div
                    key={p.outcome.key}
                    className={`gtp-badge-tile${p.tier ? "" : " locked"}`}
                  >
                    <Badge
                      glyph={p.outcome.key}
                      color={p.outcome.color}
                      tier={p.tier}
                      locked={p.tier === 0}
                      size={96}
                      title={p.outcome.name}
                    />
                    <b>{p.outcome.name}</b>
                    <span className="gtp-badge-tier">
                      {p.tierName ?? "Locked"}
                    </span>
                    <small>
                      “{p.outcome.short}” ·{" "}
                      {p.next ? `${p.next} more to upgrade` : "maxed out"}
                    </small>
                  </div>
                ))}
              </div>
              <h3>Milestones</h3>
              <div className="gtp-badge-grid">
                {marks.map((m) => (
                  <div
                    key={m.key}
                    className={`gtp-badge-tile${m.earned ? "" : " locked"}`}
                  >
                    <Badge
                      glyph={m.glyph}
                      color="#FFF4E6"
                      locked={!m.earned}
                      size={96}
                      title={m.name}
                    />
                    <b>{m.name}</b>
                    <small>{m.detail}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
