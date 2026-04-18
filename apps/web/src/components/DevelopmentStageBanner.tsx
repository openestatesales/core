import Link from "next/link";

import { getAppStage, type AppStage } from "@/config/app-stage";
import { cn } from "@/lib/utils";

function developerPortalHref() {
  if (process.env.NODE_ENV === "development") return "http://localhost:3001";
  return "https://developer.openestatesales.com";
}

type StageVisual = {
  /** "brand" = sky accent, "red" = experimental warning, "emerald" = live */
  dot: "brand" | "red" | "emerald";
  title: string;
  body: string;
};

const STAGE_COPY: Record<AppStage, StageVisual> = {
  building: {
    dot: "brand",
    title: "We're currently building.",
    body: "Feel free to poke around and break stuff. We ship fast and data might reset without warning.",
  },
  experimental: {
    dot: "red",
    title: "Experimental:",
    body: "Open to explore… Data resets weekly.",
  },
  alpha: {
    dot: "brand",
    title: "Alpha testing.",
    body: "It's early days. Code is open source—come help us make this better.",
  },
  beta: {
    dot: "brand",
    title: "Beta.",
    body: "Things are stabilizing. Thanks for helping us harden the product before the big launch.",
  },
  live: {
    dot: "emerald",
    title: "We're live.",
    body: "v1 is officially out. We're still shipping daily, but your data is safe here.",
  },
};

function StageDot({ variant }: { variant: StageVisual["dot"] }) {
  return (
    <span
      className={cn(
        "size-2 shrink-0 rounded-full",
        variant === "red" &&
          "bg-red-500 shadow-[0_0_0_3px_oklch(0.63_0.22_25/0.35)]",
        variant === "emerald" &&
          "bg-emerald-500 shadow-[0_0_0_3px_oklch(0.72_0.17_160/0.35)]",
        variant === "brand" &&
          "bg-[var(--brand)] shadow-[0_0_0_3px_oklch(0.65_0.12_238/0.28)]",
      )}
      aria-hidden
    />
  );
}

export function DevelopmentStageBanner() {
  const stage = getAppStage();
  const { dot, title, body } = STAGE_COPY[stage];

  return (
    <div
      role="status"
      aria-label={`Product stage: ${stage}`}
      className={cn(
        "border-b border-[oklch(0.62_0.11_238/0.28)]",
        "bg-[linear-gradient(90deg,oklch(0.55_0.12_238/0.12),oklch(0.5_0.1_238/0.05),oklch(0.55_0.12_238/0.12))]",
        "dark:bg-[linear-gradient(90deg,oklch(0.55_0.12_238/0.14),oklch(0.5_0.1_238/0.06),oklch(0.55_0.12_238/0.14))]",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 text-xs sm:px-6">
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1",
            "border-black/10 bg-black/[0.06] text-zinc-800",
            "dark:border-white/16 dark:bg-black/45 dark:text-[rgba(255,255,255,0.86)]",
          )}
        >
          <StageDot variant={dot} />
          <span className="min-w-0 leading-snug">
            <strong className="font-semibold">{title}</strong>{" "}
            <span
              className={cn(
                "font-normal text-zinc-600",
                "dark:text-[rgba(255,255,255,0.78)]",
              )}
            >
              {body}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
