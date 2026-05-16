import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { buildSubmittedMessage } from "@/lib/auth-messages";
import { sendSmsText } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const pendingCookies: {
    name: string;
    value: string;
    options: CookieOptions;
  }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("full_name, mobile, submitted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (appErr || !app) {
    return NextResponse.json({ error: "Application not found." }, {
      status: 404,
    });
  }

  if (!app.submitted_at) {
    return NextResponse.json({ error: "Application not submitted yet." }, {
      status: 400,
    });
  }

  const notifiedPayload: { notified: boolean } = { notified: false };

  const phone = typeof app.mobile === "string" ? app.mobile : null;
  if (!phone?.startsWith("+")) {
    const empty = NextResponse.json({ ok: true, ...notifiedPayload });
    pendingCookies.forEach(({ name, value, options }) =>
      empty.cookies.set(name, value, options)
    );
    return empty;
  }

  const name =
    typeof app.full_name === "string" && app.full_name.trim()
      ? app.full_name
      : (user.user_metadata?.full_name as string | undefined);

  const notify = await sendSmsText(phone, buildSubmittedMessage(name));
  notifiedPayload.notified = notify.ok;

  if (!notify.ok && process.env.SMS_DEV_SKIP !== "true") {
    console.warn("[application-submitted] SMS:", notify.error);
  }

  const response = NextResponse.json({ ok: true, ...notifiedPayload });
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );

  return response;
}
