import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

import { githubUsernameFromUser } from "@/lib/github-metadata";

/**
 * OAuth callback must use a Supabase client whose `setAll` writes to the
 * **redirect response** (`response.cookies`). Using `createClient()` from
 * `server.ts` + `cookies()` from `next/headers` often fails to persist the
 * session from `exchangeCodeForSession` in Route Handlers — users land
 * unauthenticated and `register_developer` never sees `auth.uid()`.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextFromCookie = request.cookies.get("oes_dev_next")?.value ?? null;
  const nextRaw =
    requestUrl.searchParams.get("next") ??
    (nextFromCookie ? decodeURIComponent(nextFromCookie) : null) ??
    "/dashboard/keys";
  const safeNext =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  let response = NextResponse.redirect(`${origin}${safeNext}`);
  // Clear one-time next cookie
  response.cookies.set("oes_dev_next", "", {
    path: "/",
    expires: new Date(0),
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=auth&reason=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const gh = githubUsernameFromUser(user);
    const { error: devError } = await supabase.rpc("register_developer", {
      p_github_username: gh,
    });
    if (devError) {
      console.error("[auth/callback] register_developer:", devError.message);
    }
  }

  return response;
}
