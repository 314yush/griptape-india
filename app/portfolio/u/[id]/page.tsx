import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import type { Entry, Profile } from "@/lib/portfolio/outcomes";
import ProfileView from "../../ProfileView";
import PdfButton from "../../PdfButton";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("learner_profiles")
    .select("*")
    .eq("learner_id", id.toUpperCase())
    .maybeSingle();
  if (!profile) return null;
  const { data: entries } = await supabase
    .from("portfolio_entries")
    .select("*")
    .eq("user_id", profile.user_id)
    .order("entry_date", { ascending: false });
  return { profile: profile as Profile, entries: (entries as Entry[]) ?? [] };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await load(params.id);
  return data
    ? { title: data.profile.full_name, description: data.profile.pursuit ?? "A Griptape learner portfolio" }
    : { title: "Portfolio not found" };
}

export default async function PublicPortfolio({ params }: { params: { id: string } }) {
  const data = await load(params.id);
  if (!data) notFound();
  return (
    <>
      <Link href="/portfolio/learners" className="gtp-back">
        ← All student portfolios
      </Link>
      <ProfileView
        profile={data.profile}
        entries={data.entries}
        toolbar={<PdfButton profile={data.profile} entries={data.entries} />}
      />
    </>
  );
}
