import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The learner portfolio runs as its own site on this hostname (same app and database).
// portfolio.griptapeindia.org/me → /portfolio/me, etc. Set PORTFOLIO_HOST to change it.
const PORTFOLIO_HOST = process.env.PORTFOLIO_HOST ?? "portfolio.griptapeindia.org";

function portfolioRewrite(request: NextRequest): URL | null {
  const host = request.headers.get("host")?.split(":")[0];
  const { pathname } = request.nextUrl;
  if (host !== PORTFOLIO_HOST) return null;
  if (/^\/(portfolio|api|auth|_next)(\/|$)/.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return null;
  const url = request.nextUrl.clone();
  url.pathname = `/portfolio${pathname === "/" ? "" : pathname}`;
  return url;
}

export async function middleware(request: NextRequest) {
  const rewriteTo = portfolioRewrite(request);
  const pass = () =>
    rewriteTo
      ? NextResponse.rewrite(rewriteTo, { request: { headers: request.headers } })
      : NextResponse.next({ request: { headers: request.headers } });
  let response = pass();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = pass();
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = pass();
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Touching auth.getUser() refreshes the session cookie if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip all Next.js internals and favicon so middleware never touches CSS/JS
     * chunks (avoids missing styles if middleware errors or the matcher mis-fires).
     */
    "/((?!_next/|favicon.ico).*)",
  ],
};
