"use client";

import type { ReactNode } from "react";

type EmptySalesProps = {
  title?: string;
  subtitle?: string;
  showTips?: boolean;
  extraActions?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function EmptySales({
  title = "We’re just getting started",
  subtitle =
    "We’re building an open directory of estate sales in your area. Check back as new sales go live—or invite a local operator to list.",
  showTips = true,
  extraActions,
  footer,
  className = "",
}: EmptySalesProps) {
  return (
    <div className={`mx-auto max-w-4xl text-center ${className}`}>
      <div className="mb-8">
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent/25 via-accent/10 to-muted sm:h-32 sm:w-32">
          <svg
            className="h-12 w-12 text-accent sm:h-16 sm:w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      </div>

      <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
        {subtitle}
      </p>

      {showTips ? (
        <div className="mb-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
          <TipCard
            icon={
              <svg
                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
            title="Follow sellers"
            body="Favorite companies and operators so you see their sales early."
            tone="indigo"
          />
          <TipCard
            icon={
              <svg
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
            title="Get notified"
            body="Turn on location and alerts for your city and distance when we ship them."
            tone="emerald"
          />
          <TipCard
            icon={
              <svg
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
            title="Spread the word"
            body="Know an estate sale company? Point them here to list for free."
            tone="purple"
          />
        </div>
      ) : null}

      <div className="space-y-4">
        {extraActions}
        {footer ?? (
          <p className="text-xs text-muted-foreground sm:text-sm">
            Open directory · AGPL-3.0 · Community-built
          </p>
        )}
      </div>
    </div>
  );
}

function TipCard({
  icon,
  title,
  body,
  tone = "indigo",
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tone?: "indigo" | "emerald" | "purple";
}) {
  const toneClasses: Record<string, string> = {
    indigo:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
  };

  return (
    <div className="rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6 dark:bg-zinc-950/40">
      <div
        className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg sm:mb-4 sm:h-12 sm:w-12 ${toneClasses[tone]}`}
      >
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-foreground sm:mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground sm:text-sm">{body}</p>
    </div>
  );
}
