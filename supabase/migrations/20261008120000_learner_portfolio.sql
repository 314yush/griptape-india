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
--   • Learners sign up and log in with their learner ID (e.g. GT-7K2M9Q) + password.
--     The auth user's email is a placeholder: gt-7k2m9q@learner.invalid.
--   • learner_profiles: one row per auth user, created by /api/portfolio/signup.
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
  cohort text,           -- e.g. "Learning Challenge 6"
  is_public boolean NOT NULL DEFAULT true,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learner_profiles ADD COLUMN IF NOT EXISTS summary text;

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
GRANT UPDATE (full_name, pursuit, bio, city, cohort, is_public)
  ON public.learner_profiles TO authenticated;
