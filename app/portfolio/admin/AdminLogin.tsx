"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/portfolio/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "login", password }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error ?? "Couldn't sign in. Check your connection.");
    router.refresh();
  }

  return (
    <div className="gtp-auth">
      <form className="gtp-auth-card gtp-form" onSubmit={submit}>
        <p className="gtp-kicker">Staff only</p>
        <h1>Portfolio admin</h1>
        <label>
          Staff password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <p className="gtp-error">{error}</p> : null}
        <button className="gtp-btn gtp-btn-orange" disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
