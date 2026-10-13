import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AuthClient from "./AuthClient";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const FALLBACK_COHORTS = [1, 2, 3, 4, 5, 6].map((id) => ({ id, name: `Cohort ${id}` }));

export default async function LoginPage() {
  const supabase = createClient();
  const [{ data: auth }, { data: cohorts }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("cohorts").select("id, name").eq("is_open", true).order("id"),
  ]);
  if (auth.user) redirect("/portfolio/me");
  return <AuthClient cohorts={cohorts?.length ? cohorts : FALLBACK_COHORTS} />;
}
