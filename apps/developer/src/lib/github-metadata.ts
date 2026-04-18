import type { User } from "@supabase/supabase-js";

/**
 * GitHub login from Supabase OAuth user_metadata / identities (provider-dependent).
 */
export function githubUsernameFromUser(user: User): string | null {
  const meta = user.user_metadata;
  if (meta && typeof meta.user_name === "string" && meta.user_name.trim()) {
    return meta.user_name.trim();
  }
  if (
    meta &&
    typeof meta.preferred_username === "string" &&
    meta.preferred_username.trim()
  ) {
    return meta.preferred_username.trim();
  }
  const gh = user.identities?.find((i) => i.provider === "github");
  const data = gh?.identity_data;
  if (
    data &&
    typeof data === "object" &&
    "user_name" in data &&
    typeof (data as { user_name: unknown }).user_name === "string"
  ) {
    const u = (data as { user_name: string }).user_name.trim();
    return u || null;
  }
  return null;
}
