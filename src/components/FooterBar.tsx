import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { GithubIcon } from "@/components/icons/Github";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();
  const repo = "https://github.com/msabree/open-estate-sales";

  return (
    <footer
      className={cn(
        "mt-auto border-t border-border bg-surface/70 backdrop-blur-sm dark:bg-surface/60",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          © {year} Open Estate Sales · AGPL-3.0 ·{" "}
          <Link
            href="https://openestatesales.com"
            className="text-foreground/80 underline-offset-4 hover:text-accent hover:underline"
          >
            openestatesales.com
          </Link>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
          <ThemeToggle />
          <Link
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
          <GithubIcon className="size-5 shrink-0" />
          <span className="font-medium">Source on GitHub</span>
          <span className="sr-only">(opens in new tab)</span>
          <ExternalLink className="size-4 opacity-70" aria-hidden />
          </Link>
        </div>
      </div>
    </footer>
  );
}
