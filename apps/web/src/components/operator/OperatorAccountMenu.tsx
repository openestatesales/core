"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LayoutGrid, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type OperatorBranding = {
  logoUrl: string | null;
  letter: string;
};

function letterFromOperator(
  row: {
    company_name: string | null;
    name: string;
    operator_kind: string | null;
  } | null,
  email: string | undefined,
): string {
  if (
    row?.operator_kind === "company" &&
    row.company_name?.trim()
  ) {
    return row.company_name.trim().charAt(0).toUpperCase();
  }
  const base =
    row?.name?.trim() || email?.split("@")[0] || "?";
  return base.charAt(0).toUpperCase();
}

/**
 * Account menu: circular avatar (logo or initial), persona mode, dashboard/profile when listing, sign out.
 */
export function OperatorAccountMenu({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [branding, setBranding] = useState<OperatorBranding | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase
      .from("operators")
      .select("company_name, name, operator_kind, company_logo_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const logo =
          data?.company_logo_url?.trim() &&
          data.operator_kind === "company"
            ? data.company_logo_url.trim()
            : null;
        setBranding({
          logoUrl: logo,
          letter: letterFromOperator(data, user.email ?? undefined),
        });
      });
  }, [user?.id, user?.email]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (!open) return;
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setOpen(false);
    router.push("/sales");
    router.refresh();
  }

  if (loading || !user) {
    return null;
  }

  const displayLetter = branding?.letter ?? user.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className={cn("relative", className)} ref={wrapRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="size-9 shrink-0 rounded-full p-0"
      >
        <Avatar className="size-9 border-0">
          <AvatarImage src={branding?.logoUrl ?? undefined} alt="" />
          <AvatarFallback className="text-xs">{displayLetter}</AvatarFallback>
        </Avatar>
      </Button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-popover text-popover-foreground absolute right-0 z-50 mt-2 w-56 rounded-lg border py-1 text-sm shadow-md"
        >
          <Link
            role="menuitem"
            href="/dashboard"
            className="hover:bg-muted flex items-center gap-2 px-3 py-2 transition-colors"
            onClick={() => setOpen(false)}
          >
            <LayoutGrid className="text-muted-foreground size-4" aria-hidden />
            Dashboard
          </Link>
          <Link
            role="menuitem"
            href="/dashboard/profile"
            className="hover:bg-muted flex items-center gap-2 px-3 py-2 transition-colors"
            onClick={() => setOpen(false)}
          >
            <UserRound className="text-muted-foreground size-4" aria-hidden />
            Profile
          </Link>

          <div className="bg-border my-1 h-px" role="separator" />

          <button
            role="menuitem"
            type="button"
            className="text-destructive hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
