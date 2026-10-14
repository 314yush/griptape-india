-- =============================================================================
-- Griptape India — Learner Portfolio
-- =============================================================================
--
-- HOW TO USE
--   Paste this whole file in Supabase Dashboard → SQL → Run (after the apply schema).
--
-- Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS.
--
-- MODEL
--   • Learners sign in with: cohort + full name + their own password.
--     First time, they use the cohort's shared code (hashed in public.cohorts) and then
--     choose their own password; that creates their portfolio. After that only their own
--     password works. /api/portfolio/signin does all of this.
--   • Forgot password: staff run SELECT public.reset_learner_password('GT-XXXXXX');
--     the learner then uses the cohort code again to choose a new one.
--   • Each learner still gets a learner ID (e.g. GT-7K2M9Q) for their public link and PDF.
--     The auth user's email is a placeholder: gt-7k2m9q@learner.invalid (never emailed).
--   • learner_profiles: one row per auth user, unique per (cohort, name).
--     summary is written by the server after each new entry.
--   • portfolio_entries: what the learner did and how they did it. outcomes holds
--     the skills detected by the server (/api/portfolio/entries); badges are computed
--     from them in lib/portfolio/outcomes.ts.
--   • Learners can't write outcomes or summary themselves: entry inserts/updates go
--     through the server (service role), and profile updates are limited to the
--     editable columns. Public profiles are readable by anyone.
-- =============================================================================


-- Readable, unambiguous ID: no 0/O/1/I
CREATE OR REPLACE FUNCTION public.gen_learner_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  candidate text;
BEGIN
  LOOP
    candidate := 'GT-';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.learner_profiles WHERE learner_id = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;


CREATE TABLE IF NOT EXISTS public.learner_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  learner_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  pursuit text,          -- "the one thing" they're chasing
  bio text,
  city text,
  cohort text,           -- display name, e.g. "Cohort 6"
  cohort_id integer,
  is_public boolean NOT NULL DEFAULT true,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learner_profiles ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE public.learner_profiles ADD COLUMN IF NOT EXISTS cohort_id integer;
ALTER TABLE public.learner_profiles ADD COLUMN IF NOT EXISTS name_key text;  -- lower-cased, single-spaced name for sign-in
ALTER TABLE public.learner_profiles ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS learner_profiles_cohort_name
  ON public.learner_profiles (cohort_id, name_key);

-- Default can't reference the table before it exists, so set it afterwards
ALTER TABLE public.learner_profiles
  ALTER COLUMN learner_id SET DEFAULT public.gen_learner_id();

DROP TRIGGER IF EXISTS set_updated_at_on_learner_profiles ON public.learner_profiles;
CREATE TRIGGER set_updated_at_on_learner_profiles
  BEFORE UPDATE ON public.learner_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


CREATE TABLE IF NOT EXISTS public.portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.learner_profiles (user_id) ON DELETE CASCADE,
  title text NOT NULL,
  area text,             -- pursuit area, e.g. 'Tech & Code'
  stage text NOT NULL DEFAULT 'started'
    CHECK (stage IN ('started', 'building', 'shipped')),
  entry_date date NOT NULL DEFAULT current_date,
  hours numeric(6,1) NOT NULL DEFAULT 0 CHECK (hours >= 0 AND hours <= 2000),
  what_i_did text NOT NULL,
  how_i_did_it text,
  what_i_learned text,
  evidence_url text,
  outcomes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_entries_user_date
  ON public.portfolio_entries (user_id, entry_date DESC);

DROP TRIGGER IF EXISTS set_updated_at_on_portfolio_entries ON public.portfolio_entries;
CREATE TRIGGER set_updated_at_on_portfolio_entries
  BEFORE UPDATE ON public.portfolio_entries
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public profiles readable" ON public.learner_profiles;
CREATE POLICY "public profiles readable"
  ON public.learner_profiles FOR SELECT
  USING (is_public OR auth.uid() = user_id);

DROP POLICY IF EXISTS "learner inserts own profile" ON public.learner_profiles;

DROP POLICY IF EXISTS "learner updates own profile" ON public.learner_profiles;
CREATE POLICY "learner updates own profile"
  ON public.learner_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "entries readable with profile" ON public.portfolio_entries;
CREATE POLICY "entries readable with profile"
  ON public.portfolio_entries FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.learner_profiles p
      WHERE p.user_id = portfolio_entries.user_id AND p.is_public
    )
  );

DROP POLICY IF EXISTS "learner writes own entries" ON public.portfolio_entries;
DROP POLICY IF EXISTS "learner deletes own entries" ON public.portfolio_entries;
CREATE POLICY "learner deletes own entries"
  ON public.portfolio_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Column-level locks so badges and summaries can't be self-awarded through the API.
-- (The service role bypasses these; it's what the server routes use.)
REVOKE INSERT, UPDATE ON public.portfolio_entries FROM anon, authenticated;
REVOKE INSERT, UPDATE ON public.learner_profiles FROM anon, authenticated;
-- Name and cohort are how learners sign in, so only staff change them
GRANT UPDATE (pursuit, bio, city, is_public)
  ON public.learner_profiles TO authenticated;


-- ---------------------------------------------------------------------------
-- Cohorts and their shared first-time codes
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.cohorts (
  id integer PRIMARY KEY,
  name text NOT NULL,
  password_hash text,     -- bcrypt of the cohort code; NULL = new sign-ups closed
  is_open boolean NOT NULL DEFAULT true
);

INSERT INTO public.cohorts (id, name) VALUES
  (1, 'Cohort 1'), (2, 'Cohort 2'), (3, 'Cohort 3'),
  (4, 'Cohort 4'), (5, 'Cohort 5'), (6, 'Cohort 6')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
-- Anyone may see the cohort list (for the sign-in dropdown), never the hashes
DROP POLICY IF EXISTS "cohort names readable" ON public.cohorts;
CREATE POLICY "cohort names readable" ON public.cohorts FOR SELECT USING (true);
REVOKE ALL ON public.cohorts FROM anon, authenticated;
GRANT SELECT (id, name, is_open) ON public.cohorts TO anon, authenticated;

-- Staff: set or change a cohort code from the SQL Editor, e.g.
--   SELECT public.set_cohort_password(1, 'sunflower-42');
-- Changing it only affects first-time sign-ins; learners keep their own passwords.
CREATE OR REPLACE FUNCTION public.set_cohort_password(p_cohort integer, p_password text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  UPDATE public.cohorts
  SET password_hash = crypt(p_password, gen_salt('bf'))
  WHERE id = p_cohort;
$$;

-- Server-only check used by /api/portfolio/signin
CREATE OR REPLACE FUNCTION public.check_cohort_password(p_cohort integer, p_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT coalesce(
    (SELECT is_open AND password_hash IS NOT NULL AND password_hash = crypt(p_password, password_hash)
     FROM public.cohorts WHERE id = p_cohort),
    false);
$$;

-- Staff: let a learner who forgot their password choose a new one, e.g.
--   SELECT public.reset_learner_password('GT-7K2M9Q');
-- (Find IDs with: SELECT learner_id, full_name, cohort FROM learner_profiles ORDER BY cohort_id, full_name;)
CREATE OR REPLACE FUNCTION public.reset_learner_password(p_learner_id text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.learner_profiles SET password_set = false
  WHERE learner_id = upper(p_learner_id)
  RETURNING full_name || ' can now sign in with the cohort code and choose a new password';
$$;

REVOKE ALL ON FUNCTION public.reset_learner_password(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_cohort_password(integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_cohort_password(integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gen_learner_id() FROM PUBLIC, anon, authenticated;
