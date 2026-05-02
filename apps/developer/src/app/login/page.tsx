"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const INTEGRATION_IDEAS = [
  {
    icon: "⚡",
    title: "SDKs",
    body: "Typed client helpers and shared primitives in packages/sdk.",
  },
  {
    icon: "{ }",
    title: "REST API",
    body: "Query listings, locations, and metadata from your own services.",
  },
  {
    icon: "GH",
    title: "OAuth",
    body: "Use OAuth to authenticate and authorize your app to access OES data.",
  },
  {
    icon: "↗",
    title: "Embeds & links",
    body: "Deep-link and surface estate content inside partner apps and sites.",
  },
] as const;

/** After GitHub OAuth, send developers to the dashboard unless `?next=` is set. */
function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard/keys";
  }
  return raw;
}

function LoginInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const reason = searchParams.get("reason");
  const nextPath = safeNextPath(searchParams.get("next"));

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    const q = new URLSearchParams({ next: nextPath });
    return `${window.location.origin}/auth/callback?${q.toString()}`;
  }, [nextPath]);

  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function signInWithGitHub() {
    setBusy(true);
    setLocalError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLocalError(
        "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setLocalError(error.message);
      setBusy(false);
    }
  }

  return (
    <main className="loginSplit">
      <div className="loginSplitForm">
        <div className="loginSplitFormInner">
          <p className="kicker" style={{ marginBottom: 8 }}>
            Developer portal
          </p>
          <h1 className="h2" style={{ marginTop: 0 }}>
            Sign in to build with OES
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            We use GitHub signin for developer accounts.
          </p>

          {(error || localError) && (
            <div className="loginSplitError" role="alert">
              {localError ??
                reason ??
                "Authentication failed. Please try again."}
            </div>
          )}

          <div className="ctaRow" style={{ marginTop: 22 }}>
            <button
              type="button"
              className="btn btnPrimary"
              onClick={signInWithGitHub}
              disabled={busy}
              style={{
                cursor: busy ? "not-allowed" : "pointer",
                minWidth: 200,
              }}
            >
              <GitHubIcon />
              {busy ? "Redirecting…" : "Continue with GitHub"}
            </button>
          </div>

          <p className="lede" style={{ marginTop: 20, fontSize: 13 }}>
            <Link className="subtleLink" href="/">
              ← Back to portal home
            </Link>
          </p>
        </div>
      </div>

      <aside className="loginSplitAside" aria-label="Platform integrations">
        <div className="loginSplitAsideInner">
          <h2 className="loginSplitAsideTitle">
            Connect your stack to estate sales
          </h2>
          <p className="loginSplitAsideLede">
          Build on the open standard for estate sales. Access the APIs and SDKs you need to sync inventory, trigger real-time notifications, and launch custom partner integrations.
          </p>
          <div className="loginSplitFeatures">
            {INTEGRATION_IDEAS.map((item) => (
              <div key={item.title} className="loginSplitFeature">
                <div className="loginSplitFeatureIcon" aria-hidden>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
