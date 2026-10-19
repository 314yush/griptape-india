"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthClient({ cohorts }: { cohorts: { id: number; name: string }[] }) {
  const router = useRouter();
  const [cohortId, setCohortId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  // Second step, shown the first time someone signs in with their cohort code
  const [choosing, setChoosing] = useState<null | { isNew: boolean }>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (choosing && newPassword !== confirm) return setError("Those two passwords don't match.");
    setBusy(true);
    try {
      const res = await fetch("/api/portfolio/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cohort_id: Number(cohortId),
          full_name: name,
          password,
          new_password: choosing ? newPassword : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't sign you in.");
      if (data.needs_new_password) {
        setChoosing({ isNew: Boolean(data.is_new) });
        setBusy(false);
        return;
      }
      router.push("/portfolio/me");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  if (choosing) {
    return (
      <div className="gtp-auth">
        <div className="gtp-auth-card">
          <p className="gtp-kicker">{choosing.isNew ? `Welcome, ${name.split(" ")[0]}!` : "Welcome back"}</p>
          <h1>Choose your password</h1>
          <p className="gtp-muted">
            From now on you&apos;ll sign in with your cohort, your name and this password. Pick one you&apos;ll remember, and don&apos;t forget it! Keep it to yourself.
          </p>
          <form onSubmit={submit} className="gtp-form gtp-signin-form">
            <label>
              Your new password
              <input
                required
                autoFocus
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </label>
            <label>
              Type it again
              <input required type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </label>
            {error ? <p className="gtp-error">{error}</p> : null}
            <button className="gtp-btn gtp-btn-orange gtp-btn-block" disabled={busy}>
              {busy ? "One sec…" : choosing.isNew ? "Create my portfolio" : "Save and sign in"}
            </button>
          </form>
          <p className="gtp-auth-foot">
            <button
              type="button"
              className="gtp-link"
              onClick={() => {
                setChoosing(null);
                setError(null);
              }}
            >
              ← Back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gtp-auth">
      <div className="gtp-auth-card">
        <span className="mascot-img gtp-auth-mascot" aria-hidden />
        <h1>Sign in</h1>
        <p className="gtp-muted">Pick your cohort, type your full name and your password.</p>

        <form onSubmit={submit} className="gtp-form gtp-signin-form">
          <label>
            Your cohort
            <select required value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
              <option value="" disabled>
                Choose…
              </option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Your full name
            <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Aarav Mehta" />
          </label>
          <label>
            <span>
              Password <small className="gtp-optional">(first time? use your cohort code)</small>
            </span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>

          {error ? <p className="gtp-error">{error}</p> : null}

          <button className="gtp-btn gtp-btn-orange gtp-btn-block" disabled={busy}>
            {busy ? "One sec…" : "Sign in"}
          </button>
        </form>

        <p className="gtp-auth-foot gtp-muted">
          Use the same name every time, and remember your password.
        </p>
      </div>
    </div>
  );
}
