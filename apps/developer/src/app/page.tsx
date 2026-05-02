import { redirect } from "next/navigation";

import { Landing } from "../components/Landing";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DeveloperHomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const code = typeof sp.code === "string" ? sp.code : undefined;

  // Supabase may redirect to `site_url` (/) with ?code= instead of /auth/callback.
  // Forward so exchangeCodeForSession runs and session cookies are set.
  if (code) {
    const nextRaw = sp.next;
    const next =
      typeof nextRaw === "string" &&
      nextRaw.startsWith("/") &&
      !nextRaw.startsWith("//")
        ? nextRaw
        : "/dashboard/keys";
    const q = new URLSearchParams({ code, next });
    redirect(`/auth/callback?${q.toString()}`);
  }

  return (
    <Landing>
      <div style={{ marginTop: 26 }} />
    </Landing>
  );
}
