import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const hint =
      !key
        ? " Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Settings → API → service_role secret)."
        : " Set NEXT_PUBLIC_SUPABASE_URL in .env.local.";
    throw new Error(
      `Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for server-side admin.${hint}`
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
