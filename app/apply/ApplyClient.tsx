"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { normalizeIndianPhone } from "@/lib/phone";
import {
  formatAuthFailure,
  logPhoneAuthFailure,
} from "@/lib/phone-auth-log";

const APPLY_STAGE_DEV =
  process.env.NEXT_PUBLIC_APPLY_STAGE_DEV === "1" ||
  process.env.NEXT_PUBLIC_APPLY_STAGE_DEV === "true";

/** sessionStorage — survives refresh; clears when tab closes */
const APPLY_STAGE_STORAGE_KEY = "griptape-apply:dev-stage-override";

// ============================================================================
// TYPES
// ============================================================================

type AppUser = {
  id: string;
  email: string | null;
  full_name?: string;
  phone_e164?: string;
};

type Application = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  mobile: string | null;
  whatsapp_optin: boolean | null;
  school: string | null;
  heard_from: string | null;
  one_thing: string | null;
  current_stage: string | null;
  what_to_build: string | null;
  why_this_why_now: string | null;
  already_tried: string | null;
  what_scares_you: string | null;
  backers: string | null;
  commitment_yn: boolean | null;
  video_url: string | null;
  step_1_completed_at: string | null;
  step_2_completed_at: string | null;
  step_3_completed_at: string | null;
  submitted_at: string | null;
  review_status: string;
};

type Step = "signin" | "form" | "video" | "dashboard";

/** Post-login wizard screens only (omit when using dev overrides). */
type ApplyWizardStep = Exclude<Step, "signin">;

function emailIsSynthetic(loginEmail: string | null | undefined): boolean {
  return Boolean(loginEmail?.endsWith("@phone.invalid"));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ApplyClient({
  initialUser,
  initialApplication,
}: {
  initialUser: AppUser | null;
  initialApplication: Application | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [application, setApplication] = useState<Application | null>(
    initialApplication
  );

  const [stageDevOverride, setStageDevOverride] = useState<
    ApplyWizardStep | null
  >(null);

  const updateStageDevOverride = useCallback((next: ApplyWizardStep | null) => {
    setStageDevOverride(next);
    if (!APPLY_STAGE_DEV || typeof window === "undefined") return;
    try {
      if (next === null) {
        sessionStorage.removeItem(APPLY_STAGE_STORAGE_KEY);
      } else {
        sessionStorage.setItem(APPLY_STAGE_STORAGE_KEY, next);
      }
    } catch {
      /* ignore quota / privacy mode */
    }
  }, []);

  useEffect(() => {
    setApplication(initialApplication);
  }, [initialApplication]);

  useEffect(() => {
    if (!APPLY_STAGE_DEV || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(APPLY_STAGE_STORAGE_KEY);
      if (raw === "form" || raw === "video" || raw === "dashboard") {
        setStageDevOverride(raw);
      }
    } catch {
      /* noop */
    }
  }, []);

  const backendStep: Step = !user
    ? "signin"
    : application?.submitted_at
      ? "dashboard"
      : application?.step_2_completed_at
        ? "video"
        : "form";

  const step: Step =
    APPLY_STAGE_DEV && user && application && stageDevOverride !== null
      ? stageDevOverride
      : backendStep;

  const refreshApplication = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      console.error("[apply/client] refreshApplication:", {
        message: error.message,
        code: error.code,
      });
      return;
    }
    if (data) setApplication(data as Application);
  }, [supabase, user]);

  useEffect(() => {
    void refreshApplication();
  }, [user?.id, refreshApplication]);

  const handleLogout = async () => {
    updateStageDevOverride(null);
    await supabase.auth.signOut();
    setUser(null);
    setApplication(null);
    router.refresh();
  };

  return (
    <div id="apply-flow" className={APPLY_STAGE_DEV ? "apply-flow-dev-toolbar" : undefined}>
      <nav className="apply-top" aria-label="Site">
        <Link href="/" className="brand">
          <span className="mascot-img" aria-hidden />
          Griptape <em>India</em>
        </Link>
        <ul>
          <li>
            <Link href="/#about-ngo">About</Link>
          </li>
          <li>
            <Link href="/#learning-challenge">The Challenge</Link>
          </li>
          <li>
            <Link href="/#stories">Stories</Link>
          </li>
        </ul>
        <div className="apply-top-actions">
          <Link href="/apply" className="btn btn-primary nav-btn">
            Apply
          </Link>
          <Link href="/#fund" className="btn btn-secondary nav-btn">
            Support
          </Link>
          {user && (
            <button type="button" className="logout" onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
      </nav>

      <div className="shell">
      {step === "signin" && (
        <SignInWithOtp
          onAuthed={(u) => {
            setUser(u);
            router.refresh();
          }}
        />
      )}

      {user && (step === "form" || step === "video") && !application && (
        <div className="card">
          <p>Loading your application…</p>
        </div>
      )}

      {step === "form" && user && application && (
        <ApplicationForm
          application={application}
          user={user}
          onComplete={async () => {
            await refreshApplication();
            router.refresh();
          }}
        />
      )}
      {step === "video" && user && application && (
        <VideoStep
          application={application}
          onComplete={async () => {
            await refreshApplication();
            router.refresh();
          }}
        />
      )}
      {step === "dashboard" && application && user && (
        <Dashboard application={application} loginEmail={user.email ?? null} />
      )}
      </div>

      {APPLY_STAGE_DEV ? (
        <ApplyStageDevStrip
          loggedIn={!!user}
          hasApplication={!!application}
          backendStep={backendStep}
          override={stageDevOverride}
          effectiveStep={step}
          onPick={updateStageDevOverride}
        />
      ) : null}
    </div>
  );
}

function ApplyStageDevStrip({
  loggedIn,
  hasApplication,
  backendStep,
  override,
  effectiveStep,
  onPick,
}: {
  loggedIn: boolean;
  hasApplication: boolean;
  backendStep: Step;
  override: ApplyWizardStep | null;
  effectiveStep: Step;
  onPick: (stage: ApplyWizardStep | null) => void;
}) {
  const canJump = loggedIn && hasApplication;
  return (
    <div
      className="apply-dev-stage-strip"
      role="region"
      aria-label="Development-only apply stage overrides"
    >
      <strong className="apply-dev-stage-label">DEV stages</strong>
      <span className="apply-dev-stage-hint">
        Client preview only · no DB changes · clears on{" "}
        <kbd className="apply-dev-stage-kbd">sessionStorage</kbd> tab close
      </span>
      <div className="apply-dev-stage-row">
        <span className="apply-dev-stage-meta">
          live:{" "}
          <code>{backendStep}</code>
          {override !== null ? (
            <>
              {" · "}
              showing: <code>{effectiveStep}</code>
            </>
          ) : null}
        </span>
        <div className="apply-dev-stage-btns">
          <button
            type="button"
            disabled={!loggedIn || !override}
            onClick={() => onPick(null)}
          >
            Auto
          </button>
          <button
            type="button"
            disabled={!canJump}
            aria-pressed={override === "form"}
            title={
              !canJump
                ? "Load an application draft first"
                : "Show questionnaire UI"
            }
            onClick={() => onPick("form")}
          >
            Form
          </button>
          <button
            type="button"
            disabled={!canJump}
            aria-pressed={override === "video"}
            title={
              !canJump ? "Load an application draft first" : "Show video UI"
            }
            onClick={() => onPick("video")}
          >
            Video
          </button>
          <button
            type="button"
            disabled={!canJump}
            aria-pressed={override === "dashboard"}
            title={
              !canJump
                ? "Load an application draft first"
                : "Show post-submit dashboard UI"
            }
            onClick={() => onPick("dashboard")}
          >
            Dashboard
          </button>
        </div>
      </div>
      {!loggedIn ? (
        <p className="apply-dev-stage-tip">Sign in — then jump between screens.</p>
      ) : !hasApplication ? (
        <p className="apply-dev-stage-tip">Waiting on application row…</p>
      ) : null}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

function ProgressRail({ highlight }: { highlight: 2 | 3 }) {
  const steps: { n: 1 | 2 | 3; label: string; state: "done" | "current" | "" }[] =
    [
      { n: 1, label: "Profile", state: "done" },
      {
        n: 2,
        label: "The form",
        state: highlight === 2 ? "current" : "done",
      },
      {
        n: 3,
        label: "Video",
        state: highlight === 3 ? "current" : "",
      },
    ];
  return (
    <div className="progress">
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "contents" }}>
          <div
            className={`progress-step ${
              s.state === "done" ? "done" : s.state === "current" ? "current" : ""
            }`}
          >
            <span className="num">{s.state === "done" ? "✓" : s.n}</span>
            <span>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <>
              <span className="progress-mascot-sep" aria-hidden>
                <span className="mascot-img icon-inline" />
              </span>
              <div className="progress-divider" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ApplyMicroMarquee() {
  const segment = (
    <span>
      <span className="mascot-img icon-inline" aria-hidden />
      YOU CHOOSE · WE TRUST · 10 WEEKS · ONE PURSUIT
      <span className="mascot-img icon-inline" aria-hidden />
    </span>
  );
  return (
    <div className="apply-micro-marquee" aria-hidden>
      <div className="apply-micro-marquee-inner">
        {segment}
        {segment}
      </div>
    </div>
  );
}

// ============================================================================
// SIGN IN — Supabase Phone / SMS (Twilio via Auth provider settings)
//
// CANONICAL FLOW (do not replace without an explicit product decision):
// 1. signInWithOtp({ phone: E.164, options: { channel: "sms", data: { full_name, phone_e164 } } })
// 2. verifyOtp({ phone: E.164, token, type: "sms" })
// 3. getUser() → onAuthed → /apply page creates applications row if missing (see page.tsx)
// SMS is sent by Supabase Auth (Phone provider), not custom API routes or SMS_HTTP_URL.
// ============================================================================

function SignInWithOtp({
  onAuthed,
}: {
  onAuthed: (u: AppUser) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const parsed = normalizeIndianPhone(phone);
    if (!parsed.ok) {
      setError(parsed.error);
      setErrorDetail("");
      return;
    }

    setStatus("busy");
    setError("");
    setErrorDetail("");

    const sb = createClient();

    try {
      const { error: otpErr } = await sb.auth.signInWithOtp({
        phone: parsed.e164,
        options: {
          channel: "sms",
          data: {
            full_name: fullName.trim(),
            phone_e164: parsed.e164,
          },
        },
      });

      if (otpErr) {
        logPhoneAuthFailure("signInWithOtp", otpErr, {
          phoneSuffix: parsed.e164.slice(-4),
        });
        setError(otpErr.message || "Could not send SMS.");
        setErrorDetail(
          [
            otpErr.code,
            otpErr.status !== undefined ? `HTTP ${otpErr.status}` : "",
          ]
            .filter(Boolean)
            .join(" · ")
        );
        return;
      }

      setPhoneE164(parsed.e164);
      setOtpSent(true);
    } catch (unexpected) {
      logPhoneAuthFailure("signInWithOtp", unexpected, {
        phoneSuffix: parsed.e164.slice(-4),
      });
      setError(
        "Unexpected error while requesting a code. Check the browser console for [phone-auth]."
      );
      setErrorDetail(formatAuthFailure("signInWithOtp", unexpected));
    } finally {
      setStatus("idle");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const e164 = phoneE164;
    if (!e164) {
      setError("Session expired — go back and request a new code.");
      setErrorDetail("");
      return;
    }

    setStatus("busy");
    setError("");
    setErrorDetail("");

    const sb = createClient();

    try {
      const { error: vErr } = await sb.auth.verifyOtp({
        phone: e164,
        token: otp.trim(),
        type: "sms",
      });

      if (vErr) {
        logPhoneAuthFailure("verifyOtp", vErr, {
          phoneSuffix: e164.slice(-4),
        });
        setError(vErr.message || "Invalid or expired code.");
        setErrorDetail(
          [
            vErr.code,
            vErr.status !== undefined ? `HTTP ${vErr.status}` : "",
          ]
            .filter(Boolean)
            .join(" · ")
        );
        return;
      }

      const { data: udat, error: userErr } = await sb.auth.getUser();

      if (userErr) {
        logPhoneAuthFailure("getUserAfterVerify", userErr, {
          phoneSuffix: e164.slice(-4),
        });
        setError(
          userErr.message || "Signed in but could not load your profile."
        );
        setErrorDetail(
          [
            userErr.code,
            userErr.status !== undefined ? `HTTP ${userErr.status}` : "",
          ]
            .filter(Boolean)
            .join(" · ")
        );
        return;
      }

      const u = udat.user;
      if (!u) {
        logPhoneAuthFailure(
          "getUserAfterVerify",
          new Error("getUser returned no user"),
          { phoneSuffix: e164.slice(-4) }
        );
        window.location.reload();
        return;
      }

      onAuthed({
        id: u.id,
        email: u.email ?? null,
        full_name: (u.user_metadata?.full_name as string) ?? fullName.trim(),
        phone_e164:
          (u.user_metadata?.phone_e164 as string | undefined) ??
          u.phone ??
          e164,
      });
    } catch (unexpected) {
      logPhoneAuthFailure("verifyOtp", unexpected, {
        phoneSuffix: e164.slice(-4),
      });
      setError(
        "Unexpected error while verifying. Check the browser console for [phone-auth]."
      );
      setErrorDetail(formatAuthFailure("verifyOtp", unexpected));
    } finally {
      setStatus("idle");
    }
  }

  function errorNotice() {
    if (!error) return null;
    return (
      <div className="notice error">
        <div>{error}</div>
        {errorDetail ? (
          <div
            style={{
              fontSize: 12,
              marginTop: 8,
              opacity: 0.92,
              fontFamily: "ui-monospace, monospace",
              wordBreak: "break-word",
            }}
          >
            {errorDetail}
          </div>
        ) : null}
      </div>
    );
  }

  if (otpSent) {
    return (
      <div>
        <div className="apply-signin-hero">
          <span className="eyebrow">Check your phone</span>
          <h1 className="page-title">
            We sent you a{" "}
            <em style={{ fontStyle: "italic", color: "var(--orange)" }}>
              code.
            </em>
          </h1>
        </div>
        <p className="page-sub">
          We&apos;ve sent a code to <strong>{phone}</strong>. Enter it below.
          Delivery can take a minute — if nothing arrives, use{" "}
          <strong>Change number</strong> below to try again.
        </p>

        <form onSubmit={handleVerify} className="card">
          <div className="field">
            <label htmlFor="otp">One-time code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              required
              maxLength={10}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {errorNotice()}
          <div className="bottom-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={status === "busy"}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setPhoneE164(null);
                setError("");
                setErrorDetail("");
              }}
            >
              ← Change number
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "busy" || otp.length < 4}
            >
              {status === "busy" ? "Verifying…" : "Log me in →"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="apply-signin-hero">
        <span className="eyebrow">Apply</span>
        <h1 className="page-title">
          Ten weeks.
          <br />
          Pick <span className="gt-accent-y">one thing</span>{" "}
          <span className="gt-accent-underline">you choose.</span>
        </h1>
      </div>

      <p className="page-sub">
        You just have to tell us who you are. We&apos;ll text you a one-time
        login code.
      </p>

      <form onSubmit={handleSend} className="card">
        <div className="field">
          <label htmlFor="signup_name">Your full name</label>
          <input
            id="signup_name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="signup_phone">Mobile number</label>
          <p className="helper">
            We&apos;ll send the code to this number. Ten digits; +91 is assumed
            if you omit it.
          </p>
          <input
            id="signup_phone"
            type="tel"
            required
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {errorNotice()}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "busy"}
        >
          {status === "busy" ? "Sending…" : "Send code →"}
        </button>
      </form>

      <p
        style={{
          fontSize: 14,
          color: "var(--ink-soft)",
          marginTop: 20,
          lineHeight: 1.5,
        }}
      >
        By applying you confirm you&apos;re aged 14–19 and based in India.
      </p>
    </div>
  );
}

// ============================================================================
// STEP 2 — Full application questionnaire
// ============================================================================

function ApplicationForm({
  application,
  user,
  onComplete,
}: {
  application: Application;
  user: AppUser;
  onComplete: () => Promise<void>;
}) {
  const supabase = createClient();

  type FormShape = Pick<
    Application,
    | "full_name"
    | "age"
    | "whatsapp_optin"
    | "school"
    | "heard_from"
    | "one_thing"
    | "current_stage"
    | "what_to_build"
    | "why_this_why_now"
    | "already_tried"
    | "what_scares_you"
    | "backers"
    | "commitment_yn"
  >;

  const [form, setForm] = useState<FormShape>({
    full_name: application.full_name ?? "",
    age: application.age,
    whatsapp_optin: application.whatsapp_optin ?? true,
    school: application.school ?? "",
    heard_from: application.heard_from ?? "",
    one_thing: application.one_thing ?? "",
    current_stage: application.current_stage ?? "",
    what_to_build: application.what_to_build ?? "",
    why_this_why_now: application.why_this_why_now ?? "",
    already_tried: application.already_tried ?? "",
    what_scares_you: application.what_scares_you ?? "",
    backers: application.backers ?? "",
    commitment_yn: application.commitment_yn,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const mobileDisplay = application.mobile ?? user.phone_e164 ?? "";

  const formRef = useRef(form);
  formRef.current = form;
  const lastSavedRef = useRef(JSON.stringify(form));

  const doAutosave = useCallback(async () => {
    const current = JSON.stringify(formRef.current);
    if (current === lastSavedRef.current) return;

    const f = formRef.current;
    setAutosaveState("saving");
    const payload = {
      full_name: (f.full_name ?? "").trim(),
      age: f.age,
      whatsapp_optin: f.whatsapp_optin,
      school: (f.school ?? "").trim(),
      heard_from: f.heard_from,
      one_thing: f.one_thing,
      current_stage: f.current_stage,
      what_to_build: f.what_to_build,
      why_this_why_now: f.why_this_why_now,
      already_tried: f.already_tried,
      what_scares_you: f.what_scares_you,
      backers: f.backers,
      commitment_yn: f.commitment_yn,
    };

    const { error: saveError } = await supabase
      .from("applications")
      .update(payload)
      .eq("id", application.id);

    if (!saveError) {
      lastSavedRef.current = current;
      setAutosaveState("saved");
      setTimeout(() => setAutosaveState("idle"), 2000);
    } else {
      setAutosaveState("idle");
    }
  }, [supabase, application.id]);

  useEffect(() => {
    const t = setTimeout(doAutosave, 1500);
    return () => clearTimeout(t);
  }, [form, doAutosave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const age =
      typeof form.age === "number"
        ? form.age
        : parseInt(String(form.age ?? ""), 10);

    if (Number.isNaN(age) || age < 14 || age > 19) {
      setError(
        "Griptape India is for young people aged 14–19. If that's not you yet, come back when it is."
      );
      setSubmitting(false);
      return;
    }

    const textFields: [string, string][] = [
      ["school", form.school ?? ""],
      ["one_thing", form.one_thing ?? ""],
      ["what_to_build", form.what_to_build ?? ""],
      ["why_this_why_now", form.why_this_why_now ?? ""],
      ["already_tried", form.already_tried ?? ""],
      ["what_scares_you", form.what_scares_you ?? ""],
      ["backers", form.backers ?? ""],
    ];
    for (const [, value] of textFields) {
      if (value.trim().length < 10) {
        setError(
          "A few answers feel a bit too short. Take another minute — your honest words matter more than tidy ones."
        );
        setSubmitting(false);
        return;
      }
    }

    if (!form.heard_from) {
      setError("Tell us how you heard about us before continuing.");
      setSubmitting(false);
      return;
    }
    if (!form.current_stage) {
      setError("Pick the stage you're at before continuing.");
      setSubmitting(false);
      return;
    }
    if (form.commitment_yn !== true) {
      setError(
        "The Champion calls are non-negotiable. If you can't commit to twice a week, this isn't the right year."
      );
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        full_name: (form.full_name ?? "").trim(),
        age,
        whatsapp_optin: form.whatsapp_optin,
        school: (form.school ?? "").trim(),
        heard_from: form.heard_from,
        one_thing: form.one_thing,
        current_stage: form.current_stage,
        what_to_build: form.what_to_build,
        why_this_why_now: form.why_this_why_now,
        already_tried: form.already_tried,
        what_scares_you: form.what_scares_you,
        backers: form.backers,
        commitment_yn: form.commitment_yn,
        step_2_completed_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    await onComplete();
    setSubmitting(false);
  };

  return (
    <div>
      <ProgressRail highlight={2} />
      <ApplyMicroMarquee />
      <span className="eyebrow">⤿ step 1 done · step 2 of 3 · ~15 minutes</span>

      <div className="card" style={{ marginBottom: 24 }}>
        <strong style={{ letterSpacing: 0.5 }}>Step 1 · You&apos;re in</strong>
        <p className="page-sub" style={{ marginBottom: 0, marginTop: 8 }}>
          Logged in as <strong>{mobileDisplay}</strong>
          <br />
          You can leave and come back any time — we save your draft on this phone.
        </p>
      </div>

      <h1 className="page-title">Now for the honest part.</h1>
      <p className="page-sub">
        We&apos;re not looking for tidy answers — we&apos;re looking for{" "}
        <em>yours.</em>
        {autosaveState === "saving" && (
          <span className="autosave-tag">saving…</span>
        )}
        {autosaveState === "saved" && (
          <span className="autosave-tag">saved ✓</span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="full_name">Your full name</label>
          <input
            id="full_name"
            type="text"
            required
            value={form.full_name ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, full_name: e.target.value }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="mobile_display">Your mobile number</label>
          <input
            id="mobile_display"
            type="tel"
            readOnly
            disabled
            value={mobileDisplay}
          />
          <label className="checkbox-row" style={{ marginTop: 10 }}>
            <input
              type="checkbox"
              checked={form.whatsapp_optin ?? false}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  whatsapp_optin: e.target.checked,
                }))
              }
            />
            <span>
              It&apos;s okay to text me about updates to my application.
            </span>
          </label>
        </div>

        <div className="field">
          <label htmlFor="age">How old are you?</label>
          <p className="helper">Open to ages 14 to 19.</p>
          <input
            id="age"
            type="number"
            min={14}
            max={19}
            required
            value={form.age ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                age: e.target.value ? parseInt(e.target.value, 10) : null,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="school">Which school do you go to?</label>
          <p className="helper">
            If you&apos;ve finished school, enter the school you most recently attended.
          </p>
          <input
            id="school"
            type="text"
            required
            value={form.school ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, school: e.target.value }))
            }
          />
        </div>

        <div className="field">
          <span className="label">How did you hear about Griptape India?</span>
          <div className="radio-group">
            {[
              "A friend told me",
              "From my school",
              "Instagram or social media",
              "An adult who knows Griptape India",
              "Other / can't remember",
            ].map((opt) => (
              <label key={opt} className="radio-option">
                <input
                  type="radio"
                  name="heard_from"
                  value={opt}
                  checked={form.heard_from === opt}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      heard_from: e.target.value,
                    }))
                  }
                  required
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <hr style={{ margin: "32px 0", borderColor: "var(--ink-soft)" }} />

        <div className="field">
          <label htmlFor="one_thing">
            What&apos;s the one thing you keep coming back to — the thing
            you&apos;d spend a Saturday on for free?
          </label>
          <textarea
            id="one_thing"
            required
            value={form.one_thing ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, one_thing: e.target.value }))
            }
            placeholder="Music, code, food, sport, art…"
          />
        </div>

        <div className="field">
          <span className="label">Where are you with this thing right now?</span>
          <div className="radio-group">
            {[
              { v: "hunch", l: "It's a hunch I want to test." },
              { v: "exploring", l: "I've started exploring it." },
              {
                v: "producing",
                l: "I've been doing this on my own for a while.",
              },
            ].map(({ v, l }) => (
              <label key={v} className="radio-option">
                <input
                  type="radio"
                  name="current_stage"
                  value={v}
                  checked={form.current_stage === v}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      current_stage: e.target.value,
                    }))
                  }
                  required
                />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="what_to_build">
            If you got 10 weeks, a mentor, and a small budget — what would you
            actually try to make, learn, or build?
          </label>
          <p className="helper">
            Be specific. &quot;I want to learn music&quot; is vague. &quot;I want to write,
            record, and release 3 songs&quot; is real.
          </p>
          <textarea
            id="what_to_build"
            required
            value={form.what_to_build ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                what_to_build: e.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="why_this_why_now">Why this thing, and why now?</label>
          <textarea
            id="why_this_why_now"
            required
            value={form.why_this_why_now ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                why_this_why_now: e.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="already_tried">
            What have you already tried on your own?
          </label>
          <p className="helper">
            A YouTube video, a sketch, joining a club, a rough first draft —
            anything counts.
          </p>
          <textarea
            id="already_tried"
            required
            value={form.already_tried ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                already_tried: e.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="what_scares_you">
            What scares you about doing this?
          </label>
          <p className="helper">
            We&apos;re not testing you. We&apos;re learning what kind of support you&apos;ll need.
          </p>
          <textarea
            id="what_scares_you"
            required
            value={form.what_scares_you ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                what_scares_you: e.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="backers">
            Who are the adults who&apos;d back you up if you committed to this for
            10 weeks?
          </label>
          <p className="helper">
            Parents, teachers, a coach, anyone — just names and how you know them.
          </p>
          <textarea
            id="backers"
            required
            value={form.backers ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, backers: e.target.value }))
            }
          />
        </div>

        <div className="field">
          <span className="label">
            Two video calls a week with a Champion, for 10 weeks. Can you commit?
          </span>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="commitment_yn"
                checked={form.commitment_yn === true}
                onChange={() =>
                  setForm((prev) => ({ ...prev, commitment_yn: true }))
                }
                required
              />
              <span>Yes, I can commit to that.</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="commitment_yn"
                checked={form.commitment_yn === false}
                onChange={() =>
                  setForm((prev) => ({ ...prev, commitment_yn: false }))
                }
              />
              <span>Not right now.</span>
            </label>
          </div>
        </div>

        {error && <div className="notice error">{error}</div>}

        <div className="bottom-actions">
          <div className="hint">Auto-saving as you type.</div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Continue to video (Step 3) →"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// STEP 3 — Video
// ============================================================================

function VideoStep({
  application,
  onComplete,
}: {
  application: Application;
  onComplete: () => Promise<void>;
}) {
  const supabase = createClient();
  const [videoUrl, setVideoUrl] = useState(application.video_url ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValidVideoUrl = (url: string) => {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      return (
        host.includes("youtube.com") ||
        host.includes("youtu.be") ||
        host.includes("loom.com") ||
        host.includes("drive.google.com") ||
        host.includes("vimeo.com")
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!isValidVideoUrl(videoUrl)) {
      setError(
        "We accept links from YouTube (unlisted is fine), Loom, Google Drive, or Vimeo. Make sure the link is viewable — try opening it in a different browser to check."
      );
      setSubmitting(false);
      return;
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        video_url: videoUrl.trim(),
        step_3_completed_at: now,
        submitted_at: now,
        review_status: "submitted",
      })
      .eq("id", application.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    await fetch("/api/notify/application-submitted", {
      method: "POST",
      credentials: "include",
    });

    await onComplete();
    setSubmitting(false);
  };

  return (
    <div>
      <ProgressRail highlight={3} />
      <ApplyMicroMarquee />
      <span className="eyebrow">⤿ step 3 of 3 · the last one</span>
      <h1 className="page-title">Now show us.</h1>
      <p className="page-sub">
        Record a 2–3 minute video. Phone camera is fine. Look into it and tell
        us: <strong>who you are, what you want to chase, and why we should bet
        on you.</strong> We don&apos;t care about lighting or editing. We care
        about you.
      </p>

      <div className="notice">
        Upload to YouTube (unlisted), Loom, Google Drive (&quot;anyone with the
        link&quot;), or Vimeo — then paste the link below. After you submit, we ping
        you on WhatsApp so you know the application landed.
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="video_url">Paste your video link</label>
          <input
            id="video_url"
            type="url"
            required
            placeholder="https://youtu.be/…"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <p className="helper" style={{ marginTop: 10 }}>
            Before you submit: open your own link in a different browser (or
            incognito) and make sure it plays.
          </p>
        </div>

        {error && <div className="notice error">{error}</div>}

        <div
          className="notice"
          style={{ background: "var(--orange)", color: "var(--cream)" }}
        >
          <strong>Heads up:</strong> once you submit, your written answers lock,
          but you can still log in anytime. Detailed status updates arrive on WhatsApp{" "}
          {application.mobile?.trim().length ? (
            <>
              (the number tied to{" "}
              <strong>{application.mobile}</strong>
              ).
            </>
          ) : (
            "(the number tied to your application)."
          )}
        </div>

        <div className="bottom-actions">
          <div className="hint">This is the last step.</div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !videoUrl}
          >
            {submitting ? "Submitting…" : "Submit my application →"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================

function Dashboard({
  application,
  loginEmail,
}: {
  application: Application;
  loginEmail: string | null;
}) {
  const statusMap: Record<string, { label: string; copy: string; cls: string }> =
    {
      submitted: {
        label: "Submitted",
        copy:
          "We've got everything. Over the next two weeks we'll reach you on WhatsApp with timelines, what we're looking at, and any next steps — keep an eye on your messages.",
        cls: "submitted",
      },
      under_review: {
        label: "Under review",
        copy:
          "A Champion is reading your application right now. When your status changes, we'll spell it out for you on WhatsApp — replies can take a day or two.",
        cls: "review",
      },
      shortlisted: {
        label: "Shortlisted",
        copy:
          "You're on the shortlist. We'll send the concrete WhatsApp rundown (what happens next and when) shortly — ping us back there if anything's unclear.",
        cls: "review",
      },
      selected: {
        label: "Selected",
        copy:
          "You're in. Welcome to the next cohort — orientation details land on WhatsApp first, so leave notifications on for the number tied to your application.",
        cls: "submitted",
      },
      not_this_time: {
        label: "Not this time",
        copy:
          "We didn't have a spot for you this cohort, but the door stays open. We'll share the fuller note on WhatsApp so you know how to reconnect next round.",
        cls: "review",
      },
    };
  const status = statusMap[application.review_status] ?? statusMap.submitted;

  return (
    <div>
      <span className="eyebrow">⤿ your application</span>
      <h1 className="page-title">You&apos;re in the funnel.</h1>
      {application.submitted_at ? (
        <p className="page-sub">
          Submitted on{" "}
          {new Date(application.submitted_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      ) : null}

      {application.whatsapp_optin === false ? (
        <div className="notice" style={{ marginBottom: 28 }}>
          You asked us not to WhatsApp/Text application updates earlier. Someone
          from the team will still reach out over email when your status shifts.
          Prefer WhatsApp updates again? Mention it when we write in.
        </div>
      ) : null}

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <span className={`status-pill ${status.cls}`}>{status.label}</span>
        </div>
        <p style={{ fontSize: 17, lineHeight: 1.5 }}>{status.copy}</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 22, marginBottom: 16 }}>What you sent us</h3>
        <dl style={{ margin: 0 }}>
          <SummaryRow label="Name" value={application.full_name} />
          {!emailIsSynthetic(loginEmail) && (
            <SummaryRow label="Email" value={loginEmail} />
          )}
          <SummaryRow label="Mobile" value={application.mobile} />
          <SummaryRow label="Age" value={application.age?.toString() ?? null} />
          <SummaryRow label="School" value={application.school} />
          <SummaryRow label="The one thing" value={application.one_thing} />
          <SummaryRow
            label="What you want to build"
            value={application.what_to_build}
          />
          <SummaryRow
            label="Your video"
            value={
              application.video_url ? (
                <a
                  href={application.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--orange)", textDecoration: "underline" }}
                >
                  Open video link →
                </a>
              ) : null
            }
          />
        </dl>
      </div>

      <div className="apply-dash-footer">
        <span className="mascot-img" aria-hidden />
        <p className="tagline">
          Trusting young people with the time, tribe, and resources to find a
          calling worth chasing.
        </p>
      </div>

      <p
        style={{
          fontSize: 14,
          color: "var(--ink-soft)",
          marginTop: 24,
          textAlign: "center",
        }}
      >
        Need help? Reply on WhatsApp from the same number you used when you first
        applied. Parents or teachers can also reach the team at{" "}
        <a href="mailto:hello@griptape.in" style={{ color: "var(--orange)" }}>
          hello@griptape.in
        </a>
        .
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px dashed var(--ink)",
        opacity: 0.95,
      }}
    >
      <dt
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: "var(--ink-soft)",
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{value}</dd>
    </div>
  );
}
