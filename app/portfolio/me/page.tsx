import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Entry, Profile } from "@/lib/portfolio/outcomes";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "My portfolio" };
export const dynamic = "force-dynamic";

export default async function MyPortfolioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portfolio/login");

  const [{ data: profile }, { data: entries }] = await Promise.all([
    supabase.from("learner_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("portfolio_entries").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }),
  ]);

  return (
    <DashboardClient
      userId={user.id}
      suggestedName={(user.user_metadata?.full_name as string) ?? ""}
      initialProfile={(profile as Profile) ?? null}
      initialEntries={(entries as Entry[]) ?? []}
    />
  );
}
