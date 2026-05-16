# Griptape India — Apply Flow

A Next.js app that runs the three-step application flow for the Griptape India Learning Challenge. Authenticated via Supabase magic-link email. Data lives in a single `applications` table with row-level security so each student only ever sees their own row.

## What's in here

```
app/
  apply/
    page.tsx          ← server component: checks auth, loads application row
    ApplyClient.tsx   ← client component: state machine + all 3 steps + dashboard
  auth/callback/
    route.ts          ← magic-link landing route
  globals.css         ← design tokens (matches landing page)
  layout.tsx          ← font loading + html shell
  page.tsx            ← / redirects to /apply
lib/
  supabase-browser.ts ← client for Client Components
  supabase-server.ts  ← client for Server Components / Route Handlers
middleware.ts         ← refreshes auth session on every request
supabase/
  schema.sql          ← run this once in the Supabase SQL editor
```

## Local setup

1. **Create a Supabase project** at https://supabase.com (free tier is plenty).
2. **Run the schema:** open Dashboard → SQL Editor → paste `supabase/schema.sql` → Run. This creates the `applications` table and row-level-security policies.
3. **Get your keys:** Dashboard → Settings → API. Copy the *Project URL* and the *anon public* key.
4. **Configure email:** Dashboard → Authentication → Email Templates. The default "Magic Link" template is fine. Make sure Email signup is enabled under Authentication → Providers → Email.
5. **Set redirect URLs:** Dashboard → Authentication → URL Configuration. Add `http://localhost:3000/auth/callback` and your eventual production URL `https://YOUR-DOMAIN.com/auth/callback` under *Redirect URLs*.
6. **Local env:**
   ```bash
   cp .env.local.example .env.local
   # then fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL
   ```
7. **Install & run:**
   ```bash
   npm install
   npm run dev
   ```
   Visit http://localhost:3000.

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Set the three env vars in Vercel Project Settings → Environment Variables. `NEXT_PUBLIC_SITE_URL` should be your Vercel domain (e.g. `https://griptape-apply.vercel.app` or your custom domain).
4. Add the deployed URL's `/auth/callback` to Supabase → Auth → URL Configuration → Redirect URLs.
5. Deploy.

## Reading applications (for staff)

Two ways:

**Easy: the Supabase dashboard.** Go to Dashboard → Table Editor → `applications`. You'll see every applicant as a row. Filter by `review_status` to find new submissions. Update `review_status` directly to move applicants through the funnel — students see the new label on their dashboard the next time they log in.

**Better: build a tiny admin view** later when you have volume. The `supabase-server.ts` client uses the anon key, which respects RLS. To bypass RLS for admin reads, you'll need the `service_role` key (kept server-side only, never exposed to the browser) and a separate `/admin` route gated by a Griptape India staff email allowlist. Happy to build that when you need it.

## Schema fields, decoded

| Column | What it stores |
|---|---|
| `user_id`, `email` | Linked to `auth.users` |
| `full_name`, `age`, `mobile`, `whatsapp_optin`, `school`, `heard_from` | Step 1 |
| `one_thing`, `current_stage`, `what_to_build`, `why_this_why_now`, `already_tried`, `what_scares_you`, `backers`, `commitment_yn` | Step 2 |
| `video_url` | Step 3 |
| `step_1_completed_at`, `step_2_completed_at`, `step_3_completed_at`, `submitted_at` | Timestamps of progress |
| `review_status` | One of: `draft` `submitted` `under_review` `shortlisted` `selected` `not_this_time` |
| `reviewer_notes` | Free-text notes from your team |

## Behavioural details worth knowing

- **No passwords, ever.** Students log in by email + clicking a link. The link expires after one hour.
- **Step 2 auto-saves** every 1.5 seconds after the student stops typing. Lost connection ≠ lost work.
- **Once submitted, the row is locked.** RLS prevents the student from editing post-submission. They can still log in and view their dashboard.
- **Age gate** is enforced client-side. If you want it enforced server-side too, add a CHECK constraint to the `age` column.
- **Email deliverability:** Supabase's default email service is fine for testing but rate-limited. For production volume, plug in a custom SMTP provider (Resend, SendGrid, Postmark) under Auth → SMTP Settings.

## Adding the real mascot icon

In `app/globals.css`, find `.topbar .brand .icon` — right now it's a placeholder pink square. Drop your mascot PNG into `public/mascot.png` and replace that rule with:

```css
.topbar .brand .icon {
  width: 36px; height: 36px;
  background-image: url('/mascot.png');
  background-size: contain;
  background-repeat: no-repeat;
}
```

## What's not built yet (intentionally)

- Admin review interface (use Supabase Table Editor for now)
- Email notifications when status changes (add via Supabase Database Webhooks → Resend)
- A waitlist for under-14 / over-19 applicants
- Re-application after rejection (currently a student gets one row forever)
