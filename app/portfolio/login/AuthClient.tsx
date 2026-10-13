"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthClient({ cohorts }: { cohorts: { id: number; name: string }[] }) {
  const router = useRouter();
  const [cohortId, setCohortId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cohort_id: Number(cohortId), full_name: name, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't sign you in.");
      router.push("/portfolio/me");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div className="gtp-auth">
      <div className="gtp-auth-card">
        <span className="mascot-img gtp-auth-mascot" aria-hidden />
        <h1>Sign in</h1>
        <p className="gtp-muted">Pick your cohort, type your full name, and use your cohort&apos;s password.</p>

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
            Cohort password
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>

          {error ? <p className="gtp-error">{error}</p> : null}

          <button className="gtp-btn gtp-btn-orange gtp-btn-block" disabled={busy}>
            {busy ? "One sec…" : "Sign in"}
          </button>
        </form>

        <p className="gtp-auth-foot gtp-muted">
          First time? Signing in creates your portfolio. Use the same name every time.
          <br />
          Don&apos;t know your cohort password? Ask your champion.
        </p>
      </div>
    </div>
  );
}
