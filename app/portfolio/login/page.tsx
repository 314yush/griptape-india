import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AuthClient from "./AuthClient";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: { mode?: string } }) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (user) redirect("/portfolio/me");
  return <AuthClient initialMode={searchParams.mode === "signup" ? "signup" : "login"} />;
}
