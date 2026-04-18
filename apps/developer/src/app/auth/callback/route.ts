import { githubUsernameFromUser } from "@/lib/github-metadata";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const gh = githubUsernameFromUser(user);
        const { error: devError } = await supabase.rpc("register_developer", {
          p_github_username: gh,
        });
        if (devError) {
          console.error(
            "[auth/callback] register_developer:",
            devError.message,
          );
        }
      }

      const path = next.startsWith("/") ? next : "/";
      return NextResponse.redirect(`${origin}${path}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

