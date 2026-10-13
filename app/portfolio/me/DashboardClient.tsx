"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  AREAS,
  STAGES,
  milestones,
  outcomeProgress,
  type Entry,
  type Profile,
  type Stage,
} from "@/lib/portfolio/outcomes";
import ProfileView from "../ProfileView";
import PdfButton from "../PdfButton";
import Badge, { type Glyph } from "../Badge";

type EntryDraft = Omit<Entry, "id" | "user_id">;

const today = () => new Date().toISOString().slice(0, 10);

const blankEntry = (): EntryDraft => ({
  title: "",
  area: "",
  stage: "started",
  entry_date: today(),
  hours: 0,
  what_i_did: "",
  how_i_did_it: "",
  what_i_learned: "",
  evidence_url: "",
  outcomes: [],
});

type Unlock = { name: string; sub: string; glyph: Glyph; color: string; tier: number };

/** Badges present after but not before, for the celebration toast. */
function newUnlocks(before: Entry[], after: Entry[]): Unlock[] {
  const prev = outcomeProgress(before);
  const out: Unlock[] = outcomeProgress(after)
    .filter((p, i) => p.tier > prev[i].tier)
    .map((p) => ({ name: p.outcome.name, sub: p.tierName!, glyph: p.outcome.key, color: p.outcome.color, tier: p.tier }));
  const had = new Set(milestones(before).filter((m) => m.earned).map((m) => m.key));
  milestones(after)
    .filter((m) => m.earned && !had.has(m.key))
    .forEach((m) => out.push({ name: m.name, sub: "Milestone", glyph: m.glyph, color: "#FFF4E6", tier: 0 }));
  return out;
}

export default function DashboardClient({
  userId,
  suggestedName,
  initialProfile,
  initialEntries,
}: {
  userId: string;
  suggestedName: string;
  initialProfile: Profile | null;
  initialEntries: Entry[];
}) {
  const router = useRouter();
  const sb = createClient();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [editingProfile, setEditingProfile] = useState(!initialProfile);
  const [entryForm, setEntryForm] = useState<{ id: string | null; draft: EntryDraft } | null>(null);
  const [unlocks, setUnlocks] = useState<Unlock[]>([]);
  const [copied, setCopied] = useState(false);
  const [summaryVersion, setSummaryVersion] = useState(0);

  async function logout() {
    await sb.auth.signOut();
    router.push("/portfolio");
    router.refresh();
  }

  async function copyLink() {
    if (!profile) return;
    await navigator.clipboard.writeText(`${window.location.origin}/portfolio/u/${profile.learner_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteEntry(entry: Entry) {
    if (!confirm(`Delete “${entry.title}”? This can't be undone.`)) return;
    const res = await fetch(`/api/portfolio/entries?id=${entry.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setEntries((list) => list.filter((e) => e.id !== entry.id));
    setProfile((p) => (p ? { ...p, summary: data.summary } : p));
  }

  function saveEntry(saved: Entry, summary: string) {
    const next = [...entries.filter((e) => e.id !== saved.id), saved].sort((a, b) =>
      b.entry_date.localeCompare(a.entry_date)
    );
    setUnlocks(newUnlocks(entries, next));
    setEntries(next);
    setProfile((p) => (p ? { ...p, summary } : p));
    setSummaryVersion((v) => v + 1);
    setEntryForm(null);
  }

  if (!profile || editingProfile) {
    return (
      <ProfileForm
        userId={userId}
        initial={profile}
        suggestedName={suggestedName}
        onCancel={profile ? () => setEditingProfile(false) : undefined}
        onSaved={(p) => {
          setProfile(p);
          setEditingProfile(false);
        }}
      />
    );
  }

  return (
    <>
      <div className="gtp-owner-bar">
        <span>
          Your public link:{" "}
          <a href={`/portfolio/u/${profile.learner_id}`} target="_blank">
            /portfolio/u/{profile.learner_id}
          </a>
        </span>
        <div>
          <button className="gtp-link" onClick={copyLink}>
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button className="gtp-link" onClick={() => setEditingProfile(true)}>
            Edit profile
          </button>
          <button className="gtp-link" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <ProfileView
        profile={profile}
        entries={entries}
        summaryKey={summaryVersion}
        toolbar={
          <div className="gtp-toolbar">
            <button className="gtp-btn gtp-btn-orange" onClick={() => setEntryForm({ id: null, draft: blankEntry() })}>
              + Add what I did
            </button>
            <PdfButton profile={profile} entries={entries} />
          </div>
        }
        renderEntryActions={(e) => (
          <>
            <button
              className="gtp-icon-btn"
              aria-label="Edit entry"
              onClick={() => {
                const { id, user_id, ...draft } = e;
                setEntryForm({ id, draft: { ...draft, area: draft.area ?? "", how_i_did_it: draft.how_i_did_it ?? "", what_i_learned: draft.what_i_learned ?? "", evidence_url: draft.evidence_url ?? "" } });
              }}
            >
              ✎
            </button>
            <button className="gtp-icon-btn" aria-label="Delete entry" onClick={() => deleteEntry(e)}>
              ✕
            </button>
          </>
        )}
        emptyState={
          <div className="gtp-empty">
            <span className="mascot-img gtp-empty-mascot" aria-hidden />
            <h3>Your first entry unlocks your first badge</h3>
            <p>What have you worked on lately? Something small counts.</p>
            <button className="gtp-btn gtp-btn-orange" onClick={() => setEntryForm({ id: null, draft: blankEntry() })}>
              + Add what I did
            </button>
          </div>
        }
      />

      {entryForm ? (
        <EntryForm
          userId={userId}
          id={entryForm.id}
          initial={entryForm.draft}
          onClose={() => setEntryForm(null)}
          onSaved={saveEntry}
        />
      ) : null}

      {unlocks.length ? (
        <div className="gtp-modal-bg" onClick={() => setUnlocks([])}>
          <div className="gtp-unlock" onClick={(e) => e.stopPropagation()}>
            <p className="gtp-kicker">Badge unlocked!</p>
            <div className="gtp-unlock-row">
              {unlocks.map((u) => (
                <div key={u.name} className="gtp-unlock-item">
                  <Badge glyph={u.glyph} color={u.color} tier={u.tier} size={120} title={u.name} />
                  <b>{u.name}</b>
                  <span>{u.sub}</span>
                </div>
              ))}
            </div>
            <button className="gtp-btn gtp-btn-ink" onClick={() => setUnlocks([])}>
              Keep going →
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ProfileForm({
  userId,
  initial,
  suggestedName,
  onSaved,
  onCancel,
}: {
  userId: string;
  initial: Profile | null;
  suggestedName: string;
  onSaved: (p: Profile) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? suggestedName,
    pursuit: initial?.pursuit ?? "",
    bio: initial?.bio ?? "",
    city: initial?.city ?? "",
    cohort: initial?.cohort ?? "",
    is_public: initial?.is_public ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      pursuit: form.pursuit.trim() || null,
      bio: form.bio.trim() || null,
      city: form.city.trim() || null,
      cohort: form.cohort.trim() || null,
    };
    const sb = createClient();
    const q = initial
      ? sb.from("learner_profiles").update(payload).eq("user_id", userId)
      : sb.from("learner_profiles").insert({ ...payload, user_id: userId });
    const { data, error } = await q.select().single();
    setBusy(false);
    if (error) return setError(error.message);
    onSaved(data as Profile);
  }

  return (
    <div className="gtp-auth">
      <form className="gtp-auth-card gtp-form gtp-wide" onSubmit={submit}>
        <h1>{initial ? "Edit your profile" : "Set up your portfolio"}</h1>
        {!initial ? <p className="gtp-muted">This is what people see at the top of your portfolio and your PDF.</p> : null}
        <label>
          Full name
          <input required value={form.full_name} onChange={set("full_name")} />
        </label>
        <label>
          The one thing you&apos;re chasing
          <input value={form.pursuit} onChange={set("pursuit")} placeholder="e.g. Building a mobile game, learning to DJ, starting a bakery" />
        </label>
        <label>
          A line about you
          <textarea rows={3} value={form.bio} onChange={set("bio")} placeholder="Who are you, and why does this matter to you?" />
        </label>
        <div className="gtp-form-row">
          <label>
            City
            <input value={form.city} onChange={set("city")} placeholder="Bengaluru" />
          </label>
          <label>
            Cohort
            <input value={form.cohort} onChange={set("cohort")} placeholder="Learning Challenge 6" />
          </label>
        </div>
        <label className="gtp-check">
          <input type="checkbox" checked={form.is_public} onChange={set("is_public")} />
          Anyone with my link can see my portfolio
        </label>
        {error ? <p className="gtp-error">{error}</p> : null}
        <div className="gtp-form-actions">
          {onCancel ? (
            <button type="button" className="gtp-btn gtp-btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button className="gtp-btn gtp-btn-orange" disabled={busy}>
            {busy ? "Saving…" : initial ? "Save" : "Create my portfolio →"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EntryForm({
  userId,
  id,
  initial,
  onClose,
  onSaved,
}: {
  userId: string;
  id: string | null;
  initial: EntryDraft;
  onClose: () => void;
  onSaved: (e: Entry, summary: string) => void;
}) {
  const [d, setD] = useState<EntryDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof EntryDraft>(k: K, v: EntryDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    // The server works out the skills and rewrites the summary, so this can take a few seconds
    const res = await fetch(`/api/portfolio/entries${id ? `?id=${id}` : ""}`, {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(d),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error ?? "Couldn't save. Check your connection and try again.");
    onSaved(data.entry as Entry, data.summary as string);
  }

  return (
    <div className="gtp-modal-bg" onClick={onClose}>
      <form className="gtp-modal gtp-form" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="gtp-modal-head">
          <h2>{id ? "Edit entry" : "What did you do?"}</h2>
          <button type="button" className="gtp-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <label>
          Give it a title
          <input required value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Built my first level in Unity" />
        </label>
        <div className="gtp-form-row">
          <label>
            Area
            <select value={d.area ?? ""} onChange={(e) => set("area", e.target.value)}>
              <option value="">Pick one</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" required max={today()} value={d.entry_date} onChange={(e) => set("entry_date", e.target.value)} />
          </label>
          <label>
            Hours spent
            <input type="number" min={0} max={2000} step={0.5} value={d.hours} onChange={(e) => set("hours", Number(e.target.value))} />
          </label>
        </div>

        <fieldset className="gtp-stage-pick">
          <legend>Where are you with it?</legend>
          {(Object.keys(STAGES) as Stage[]).map((s) => (
            <label key={s} className={d.stage === s ? "on" : ""}>
              <input type="radio" name="stage" checked={d.stage === s} onChange={() => set("stage", s)} />
              {STAGES[s]}
            </label>
          ))}
        </fieldset>

        <label>
          What did you do?
          <textarea required rows={3} value={d.what_i_did} onChange={(e) => set("what_i_did", e.target.value)} placeholder="Describe what you made or worked on." />
        </label>
        <label>
          How did you do it?
          <textarea rows={3} value={d.how_i_did_it ?? ""} onChange={(e) => set("how_i_did_it", e.target.value)} placeholder="Steps, tools, who helped, what you tried first." />
        </label>
        <label>
          What did you learn or what was hard?
          <textarea rows={2} value={d.what_i_learned ?? ""} onChange={(e) => set("what_i_learned", e.target.value)} />
        </label>
        <label>
          Link to proof (optional)
          <input value={d.evidence_url ?? ""} onChange={(e) => set("evidence_url", e.target.value)} placeholder="Instagram post, Drive folder, YouTube, website…" />
        </label>

        <p className="gtp-auto-note">
          ✦ When you save, we&apos;ll spot the skills you used, award your badges and update your summary automatically.
        </p>

        {error ? <p className="gtp-error">{error}</p> : null}
        <div className="gtp-form-actions">
          <button type="button" className="gtp-btn gtp-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="gtp-btn gtp-btn-orange" disabled={busy}>
            {busy ? "Reading your work…" : id ? "Save changes" : "Add to my portfolio"}
          </button>
        </div>
      </form>
    </div>
  );
}
