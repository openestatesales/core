import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  /** Larger on marketing pages, compact in tight nav */
  size?: "default" | "compact";
};

/**
 * Wordmark: FREE (neon) + [ESTATE SALES] (white), condensed display style.
 */
export function SiteLogo({ className, size = "default" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "font-display inline-flex select-none items-baseline uppercase leading-none tracking-tight text-[clamp(1rem,4vw,1.75rem)]",
        size === "compact" &&
          "text-[clamp(0.875rem,3.5vw,1.25rem)]",
        className,
      )}
      aria-label="Open Estate Sales — home"
    >
      <span className="text-accent">OPEN</span>
      <span className="text-zinc-900 dark:text-zinc-100">ESTATESALES</span>
    </Link>
  );
}
