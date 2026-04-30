"use client";

import Link from "next/link";

import { OperatorAccountMenu } from "@/components/operator/OperatorAccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { SiteLogo } from "@/components/icons/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavBarProps = {
  className?: string;
};

export function NavBar({ className }: NavBarProps) {
  const { user, loading } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md dark:bg-surface/85",
        className,
      )}
    >
      <div className="flex h-14 w-full items-center gap-4 px-3 sm:h-16 sm:px-4">
        <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
          <SiteLogo size="compact" />
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
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
    </header>
  );
}
