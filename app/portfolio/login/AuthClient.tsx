"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { learnerEmail, normalizeLearnerId } from "@/lib/portfolio/ids";

type Mode = "login" | "signup";

export default function AuthClient({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [pursuit, setPursuit] = useState("");
  const [learnerId, setLearnerId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function logIn(id: string) {
    const { error } = await createClient().auth.signInWithPassword({ email: learnerEmail(id), password });
    if (error) throw error;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/portfolio/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ full_name: name, password, pursuit }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Couldn't sign you up.");
        await logIn(data.learner_id);
        setNewId(data.learner_id);
      } else {
        const id = normalizeLearnerId(learnerId);
        if (!id) throw new Error("That doesn't look like a Griptape ID. It looks like GT-7K2M9Q.");
        await logIn(id);
        router.push("/portfolio/me");
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(/invalid login/i.test(msg) ? "That ID and password don't match. Check them and try again." : msg);
    } finally {
      setBusy(false);
    }
  }

  if (newId) {
    return (
      <div className="gtp-auth">
        <div className="gtp-auth-card gtp-new-id">
          <p className="gtp-kicker">You&apos;re in!</p>
          <h1>This is your Griptape ID</h1>
          <div className="gtp-big-id">{newId}</div>
          <p className="gtp-muted">
            You&apos;ll use it with your password to log in. Write it down or take a screenshot. It&apos;s also on your
            profile.
          </p>
          <div className="gtp-form-actions gtp-center">
            <button
              type="button"
              className="gtp-btn gtp-btn-ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(newId);
                setCopied(true);
              }}
            >
              {copied ? "Copied!" : "Copy my ID"}
            </button>
            <button
              type="button"
              className="gtp-btn gtp-btn-orange"
              onClick={() => {
                router.push("/portfolio/me");
                router.refresh();
              }}
            >
              Go to my portfolio →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gtp-auth">
      <div className="gtp-auth-card">
        <span className="mascot-img gtp-auth-mascot" aria-hidden />
        <h1>{mode === "signup" ? "Start your portfolio" : "Welcome back"}</h1>
        <p className="gtp-muted">
          {mode === "signup" ? "You'll get your own Griptape ID to log in with." : "Log in with your Griptape ID."}
        </p>

        <div className="gtp-tabs gtp-auth-tabs">
          <button type="button" className={mode === "signup" ? "on" : ""} onClick={() => setMode("signup")}>
            Sign up
          </button>
          <button type="button" className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>
            Log in
          </button>
        </div>

        <form onSubmit={submit} className="gtp-form">
          {mode === "signup" ? (
            <>
              <label>
                Your full name
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Aarav Mehta" />
              </label>
              <label>
                <span>
                  What are you working on? <small className="gtp-optional">(optional)</small>
                </span>
                <input value={pursuit} onChange={(e) => setPursuit(e.target.value)} placeholder="e.g. Building a mobile game" />
              </label>
            </>
          ) : (
            <label>
              Griptape ID
              <input
                required
                value={learnerId}
                onChange={(e) => setLearnerId(e.target.value)}
                autoComplete="username"
                autoCapitalize="characters"
                placeholder="GT-7K2M9Q"
                className="gtp-id-input"
              />
            </label>
          )}
          <label>
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : ""}
            />
          </label>

          {error ? <p className="gtp-error">{error}</p> : null}

          <button className="gtp-btn gtp-btn-orange gtp-btn-block" disabled={busy}>
            {busy ? "One sec…" : mode === "signup" ? "Get my ID" : "Log in"}
          </button>
        </form>

        {mode === "login" ? (
          <p className="gtp-auth-foot gtp-muted">Forgot your ID or password? Ask your Griptape champion.</p>
        ) : null}
      </div>
    </div>
  );
}
