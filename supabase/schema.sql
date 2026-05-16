-- =============================================================================
-- Griptape India — Learning Challenge application database (canonical schema)
-- =============================================================================
--
-- HOW TO USE
--   • New Supabase project: paste this whole file in Dashboard → SQL → Run.
--   • Replacing an old version: use the RESET block at the bottom first, then run
--     this file from the top (or run the full script if you already dropped tables
--     manually as you described).
--
-- AUTH MODEL (app layer)
--   • Applicants sign in with WhatsApp OTP; auth user id is auth.users(id).
--   • public.phone_auth_mappings ties E.164 phone → auth.users.id (service_role only).
--   • public.whatsapp_otp_challenges stores peppered OTP hashes (service_role only).
--   • public.applications is one row per applicant — RLS: own row only until submitted.
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Optional: nuclear reset (comment out if you only want CREATEs)
-- Run this block ONLY if you need to recreate objects. Skip if tables never existed.
-- ---------------------------------------------------------------------------
/*
DROP TRIGGER IF EXISTS set_updated_at_on_applications ON public.applications;
DROP TABLE IF EXISTS public.whatsapp_otp_challenges CASCADE;
DROP TABLE IF EXISTS public.phone_auth_mappings CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
*/


-- ---------------------------------------------------------------------------
-- Shared trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- applications — one row per logged-in applicant
-- Flow: WhatsApp verify → row created/updated · long form · video link · submit
-- ---------------------------------------------------------------------------
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL UNIQUE
    REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Mirrors Supabase Auth email (synthetic: 91XXXXXXXXXX@phone.invalid) for joins/exports
  email text NOT NULL,

  -- Profile / intake (also collected or confirmed on the long form)
  full_name text,
  age integer,
  mobile text,
  whatsapp_optin boolean NOT NULL DEFAULT true,
  school text,
  heard_from text,

  -- Long-form narrative fields
  one_thing text,
  current_stage text, -- 'hunch' | 'exploring' | 'producing'
  what_to_build text,
  why_this_why_now text,
  already_tried text,
  what_scares_you text,
  backers text,
  commitment_yn boolean,

  -- Step 3 — video
  video_url text,

  -- Milestones (step_1 = WhatsApp sign-in / profile line in UI)
  step_1_completed_at timestamptz,
  step_2_completed_at timestamptz,
  step_3_completed_at timestamptz,
  submitted_at timestamptz,

  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft',
      'submitted',
      'under_review',
      'shortlisted',
      'selected',
      'not_this_time'
    )),

  reviewer_notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_review_status
  ON public.applications (review_status);

CREATE INDEX idx_applications_submitted_at
  ON public.applications (submitted_at DESC NULLS LAST);

DROP TRIGGER IF EXISTS set_updated_at_on_applications ON public.applications;
CREATE TRIGGER set_updated_at_on_applications
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

COMMENT ON TABLE public.applications IS 'Learning Challenge application — one row per auth user';

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applicants read own row" ON public.applications;
CREATE POLICY "applicants read own row"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "applicants insert own row" ON public.applications;
CREATE POLICY "applicants insert own row"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applicants update own row" ON public.applications;
CREATE POLICY "applicants update own row"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id AND submitted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Staff tools: use the service_role key or a Postgres role outside RLS for review/export.


-- ---------------------------------------------------------------------------
-- whatsapp_otp_challenges — hashed OTPs (service_role API routes only)
-- ---------------------------------------------------------------------------
CREATE TABLE public.whatsapp_otp_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_phone_created
  ON public.whatsapp_otp_challenges (phone_e164, created_at DESC);

COMMENT ON TABLE public.whatsapp_otp_challenges IS 'WhatsApp login OTP challenges; no direct client access';

ALTER TABLE public.whatsapp_otp_challenges ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- phone_auth_mappings — E.164 phone ↔ auth user (service_role only)
-- ---------------------------------------------------------------------------
CREATE TABLE public.phone_auth_mappings (
  phone_e164 text PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE
    REFERENCES auth.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_phone_auth_mappings_user_id
  ON public.phone_auth_mappings (user_id);

COMMENT ON TABLE public.phone_auth_mappings IS 'Deterministic phone identity for WhatsApp OTP login';

ALTER TABLE public.phone_auth_mappings ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- Grants: OTP + phone tables are backend-only (no anon/authenticated direct access)
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE public.whatsapp_otp_challenges FROM PUBLIC;
REVOKE ALL ON TABLE public.whatsapp_otp_challenges FROM anon, authenticated;

REVOKE ALL ON TABLE public.phone_auth_mappings FROM PUBLIC;
REVOKE ALL ON TABLE public.phone_auth_mappings FROM anon, authenticated;

GRANT ALL ON TABLE public.whatsapp_otp_challenges TO service_role;
GRANT ALL ON TABLE public.phone_auth_mappings TO service_role;

-- Authenticated users access applications only via policies above; table grants stay default Supabase.
