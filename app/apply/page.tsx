import { createClient } from "@/lib/supabase-server";
import ApplyClient from "./ApplyClient";
import type { Metadata } from "next";
import type { User } from "@supabase/supabase-js";
import { applicationEmailFromAuthUser } from "@/lib/auth-email";

export const metadata: Metadata = {
  title: "Apply to the Learning Challenge",
  description:
    "Apply to the Griptape India Learning Challenge — sign in with a one-time code by text, then complete the form and a short video.",
};

export const dynamic = "force-dynamic";

/** Application row for phone users — see ApplyClient SMS OTP (`user.phone` may omit leading `+`). */

function rowMobile(user: User): string {
  const meta = user.user_metadata?.phone_e164;
  if (typeof meta === "string" && meta.length > 0) return meta;
  if (typeof user.phone === "string" && user.phone.length > 0) return user.phone;
  return "";
}

export default async function ApplyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let application = null;

  if (user) {
    const { data: row, error: rowErr } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (rowErr) {
      console.error("[apply/page] load application:", {
        message: rowErr.message,
        code: rowErr.code,
        details: rowErr.details,
        hint: rowErr.hint,
      });
    }

    application = row;

    const email = applicationEmailFromAuthUser(user);
    if (!application && email) {
      const payload = {
        user_id: user.id,
        email,
        full_name: (user.user_metadata?.full_name as string) ?? "",
        mobile: rowMobile(user),
        whatsapp_optin: true,
        step_1_completed_at: new Date().toISOString(),
      };
      const { error: upsertErr } = await supabase
        .from("applications")
        .upsert(payload, {
          onConflict: "user_id",
        });
      if (upsertErr) {
        console.error("[apply/page] applications upsert:", {
          message: upsertErr.message,
          code: upsertErr.code,
          details: upsertErr.details,
        });
      }
      const { data: again, error: againErr } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (againErr) {
        console.error("[apply/page] reload application after upsert:", {
          message: againErr.message,
          code: againErr.code,
        });
      }
      application = again;
    }

    if (user && !application) {
      console.warn(
        "[apply/page] no applications row — user authenticated but derive email returned empty or upsert/query failed."
      );
    }
  }

  return (
    <ApplyClient
      key={`apply-root-${user?.id ?? "signed-out"}`}
      initialUser={
        user
          ? {
              id: user.id,
              email: user.email ?? null,
              full_name: user.user_metadata?.full_name as string | undefined,
              phone_e164:
                (user.user_metadata?.phone_e164 as string | undefined) ??
                user.phone ??
                undefined,
            }
          : null
      }
      initialApplication={application}
    />
  );
}
