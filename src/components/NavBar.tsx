import Link from "next/link";

import { SiteLogo } from "@/components/icons/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/operator", label: "Operators" },
  { href: "/sales", label: "Explore" },
] as const;

type NavBarProps = {
  className?: string;
};

export function NavBar({ className }: NavBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md dark:bg-surface/85",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <SiteLogo size="compact" />
        <nav
          className="flex items-center gap-6 text-sm font-medium uppercase tracking-wider text-muted-foreground"
          aria-label="Main"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
