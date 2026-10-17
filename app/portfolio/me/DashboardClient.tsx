"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  AREAS,
  STAGES,
  milestones,
  outcomeProgress,
  summaryFor,
  type Entry,
  type Profile,
  type Stage,
} from "@/lib/portfolio/outcomes";
import { keywordSkills } from "@/lib/portfolio/keywords";
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
  demo = false,
}: {
  userId: string;
  suggestedName: string;
  initialProfile: Profile | null;
  initialEntries: Entry[];
  /** Sample portfolio: everything happens in the browser and nothing is saved. */
  demo?: boolean;
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
  const [changingPassword, setChangingPassword] = useState(false);

  async function logout() {
    if (!demo) await sb.auth.signOut();
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
    if (demo) {
      const rest = entries.filter((e) => e.id !== entry.id);
      setEntries(rest);
      setProfile((p) => (p ? { ...p, summary: summaryFor(p, rest) } : p));
      return;
    }
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
    setProfile((p) => (p ? { ...p, summary: demo ? summaryFor(p, next) : summary } : p));
    setSummaryVersion((v) => v + 1);
    setEntryForm(null);
  }

  if (!profile || editingProfile) {
    return (
      <ProfileForm
        userId={userId}
        initial={profile}
        suggestedName={suggestedName}
        demo={demo}
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
      <div className={`gtp-owner-bar${demo ? " is-demo" : ""}`}>
        {demo ? (
          <span>
            <b>Demo portfolio.</b> Try adding, editing or deleting work. Nothing is saved.
          </span>
        ) : (
          <span>
            Your public link:{" "}
            <a href={`/portfolio/u/${profile.learner_id}`} target="_blank">
              /portfolio/u/{profile.learner_id}
            </a>
          </span>
        )}
        <div>
          {demo ? null : (
            <button className="gtp-link" onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </button>
          )}
          <button className="gtp-link" onClick={() => setEditingProfile(true)}>
            Edit profile
          </button>
          {demo ? null : (
            <button className="gtp-link" onClick={() => setChangingPassword(true)}>
              Change password
            </button>
          )}
          <button className="gtp-link" onClick={logout}>
            {demo ? "Exit demo" : "Log out"}
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
          demo={demo}
          onClose={() => setEntryForm(null)}
          onSaved={saveEntry}
        />
      ) : null}

      {changingPassword ? <PasswordForm onClose={() => setChangingPassword(false)} /> : null}

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

function PasswordForm({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== again) return setError("The two new passwords don't match.");
    setBusy(true);
    setError(null);
    const res = await fetch("/api/portfolio/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ current_password: current, new_password: next }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error ?? "Couldn't change your password. Check your connection and try again.");
    setDone(true);
  }

  return (
    <div className="gtp-modal-bg" onClick={onClose}>
      <form className="gtp-modal gtp-form" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="gtp-modal-head">
          <h2>Change password</h2>
          <button type="button" className="gtp-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {done ? (
          <>
            <p>Done! Use your new password next time you sign in.</p>
            <div className="gtp-form-actions">
              <button type="button" className="gtp-btn gtp-btn-orange" onClick={onClose}>
                OK
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              Current password
              <input type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </label>
            <label>
              New password (at least 8 characters)
              <input type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
            </label>
            <label>
              New password again
              <input type="password" required minLength={8} autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
            </label>
            {error ? <p className="gtp-error">{error}</p> : null}
            <div className="gtp-form-actions">
              <button type="button" className="gtp-btn gtp-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="gtp-btn gtp-btn-orange" disabled={busy}>
                {busy ? "Saving…" : "Change password"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function ProfileForm({
  userId,
  initial,
  suggestedName,
  onSaved,
  onCancel,
  demo = false,
}: {
  userId: string;
  initial: Profile | null;
  suggestedName: string;
  demo?: boolean;
  onSaved: (p: Profile) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    pursuit: initial?.pursuit ?? "",
    bio: initial?.bio ?? "",
    city: initial?.city ?? "",
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
      pursuit: form.pursuit.trim() || null,
      bio: form.bio.trim() || null,
      city: form.city.trim() || null,
    };
    if (demo && initial) {
      setBusy(false);
      return onSaved({ ...initial, ...payload });
    }
    const sb = createClient();
    const { data, error } = await sb.from("learner_profiles").update(payload).eq("user_id", userId).select().single();
    setBusy(false);
    if (error) return setError(error.message);
    onSaved(data as Profile);
  }

  return (
    <div className="gtp-auth">
      <form className="gtp-auth-card gtp-form gtp-wide" onSubmit={submit}>
        <h1>{initial ? "Edit your profile" : "Set up your portfolio"}</h1>
        {!initial ? <p className="gtp-muted">This is what people see at the top of your portfolio and your PDF.</p> : null}
        <p className="gtp-readonly">
          <b>{initial?.full_name || suggestedName}</b> · {initial?.cohort ?? "No cohort"}
          <small>You sign in with this name and cohort. To change them, ask your champion.</small>
        </p>
        <label>
          The one thing you&apos;re chasing
          <input value={form.pursuit} onChange={set("pursuit")} placeholder="e.g. Building a mobile game, learning to DJ, starting a bakery" />
        </label>
        <label>
          A line about you
          <textarea rows={3} value={form.bio} onChange={set("bio")} placeholder="Who are you, and why does this matter to you?" />
        </label>
        <label>
          City
          <input value={form.city} onChange={set("city")} placeholder="Bengaluru" />
        </label>
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
  demo = false,
}: {
  userId: string;
  id: string | null;
  initial: EntryDraft;
  demo?: boolean;
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
    if (demo) {
      await new Promise((r) => setTimeout(r, 700));
      const entry: Entry = {
        ...d,
        id: id ?? crypto.randomUUID(),
        user_id: userId,
        title: d.title.trim(),
        hours: Number(d.hours) || 0,
        outcomes: [],
      };
      setBusy(false);
      return onSaved({ ...entry, outcomes: keywordSkills(entry) }, "");
    }
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
