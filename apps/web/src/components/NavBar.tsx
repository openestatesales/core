"use client";

import Link from "next/link";

import { OperatorAccountMenu } from "@/components/operator/OperatorAccountMenu";
import { usePersona } from "@/components/persona/PersonaProvider";
import { SiteLogo } from "@/components/icons/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavBarProps = {
  className?: string;
};

export function NavBar({ className }: NavBarProps) {
  const { user, loading } = usePersona();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md dark:bg-surface/85",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 flex-1 items-baseline gap-2 sm:gap-3">
          <SiteLogo size="compact" />
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 md:flex-nowrap md:justify-end md:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {!loading && user ? <OperatorAccountMenu /> : null}
            {!loading && !user ? (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "font-semibold uppercase tracking-wider",
                )}
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
