"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarRange,
  Home,
  MapPin,
  Search,
} from "lucide-react";

import { CreateDraftSaleButton } from "@/components/operator/CreateDraftSaleButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { salePublicPath } from "@/utils/sales";

export type DashboardSaleRow = {
  id: string;
  title: string;
  status: string;
  city: string;
  state: string;
  created_at: string;
  start_date: string;
  end_date: string;
  region_slug: string;
  listing_slug: string;
};

type StatusFilter = "all" | "draft" | "published" | "ended";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Live" },
  { value: "ended", label: "Ended" },
];

function formatRange(start: string, end: string): string {
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const y = { year: "numeric" as const };
  if (start === end) {
    return a.toLocaleDateString("en-US", { ...opts, ...y });
  }
  return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", { ...opts, ...y })}`;
}

function statusStyle(status: string): string {
  switch (status) {
    case "published":
      return "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200";
    case "draft":
      return "bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:text-amber-100";
    case "ended":
      return "bg-zinc-500/15 text-zinc-700 ring-zinc-500/20 dark:text-zinc-300";
    default:
      return "bg-muted text-muted-foreground ring-border";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "published":
      return "Live";
    case "draft":
      return "Draft";
    case "ended":
      return "Ended";
    default:
      return status;
  }
}

type Props = {
  sales: DashboardSaleRow[];
  /** When true, show a link to edit operator profile (/dashboard/profile). */
  showOperatorProfileLink?: boolean;
};

export function OperatorDashboardHub({
  sales,
  showOperatorProfileLink = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      const okStatus = status === "all" || s.status === status;
      const okSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.listing_slug.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [sales, status, search]);

  return (
    <div className="min-h-full flex-1 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl uppercase tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Draft, publish, and manage your estate sales.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {showOperatorProfileLink ? (
              <Link
                href="/dashboard/profile"
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "rounded-lg",
                )}
              >
                Profile
              </Link>
            ) : null}
            {sales.length > 0 ? (
              <CreateDraftSaleButton
                size="sm"
                label="New sale"
                className="rounded-lg px-4"
              />
            ) : null}
          </div>
        </header>

        {/* Search + status */}
        <div className="mt-8">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex w-full max-w-3xl items-stretch gap-2">
                <div className="relative min-w-0 flex-1">
            <Search
                    className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or listing slug…"
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-zinc-800 dark:bg-zinc-950/50"
              aria-label="Search sales"
            />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={cn(
                      "h-9 rounded-full border px-3.5 text-sm font-medium transition",
                  status === opt.value
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-border bg-background/80 text-muted-foreground hover:border-accent/40 hover:text-foreground dark:border-zinc-800 dark:bg-zinc-950/40",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState hasAnySales={sales.length > 0} />
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((sale) => (
              <li key={sale.id}>
                <SaleHubCard sale={sale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SaleHubCard({ sale }: { sale: DashboardSaleRow }) {
  const dates = formatRange(sale.start_date, sale.end_date);
  const publicHref = salePublicPath(sale.region_slug, sale.listing_slug);
  const editHref = `/dashboard/sales/${sale.id}/location`;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card/90 shadow-sm transition hover:border-accent/35 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-accent/30">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 min-w-0 text-lg font-semibold leading-snug text-foreground">
            {sale.title}
          </h2>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
              statusStyle(sale.status),
            )}
          >
            {statusLabel(sale.status)}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
          <span className="truncate">
            {sale.city}, {sale.state}
          </span>
        </p>

        {dates ? (
          <p className="flex items-center gap-1.5 text-sm text-foreground/85">
            <CalendarRange className="size-4 shrink-0 text-accent" aria-hidden />
            {dates}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4 dark:border-zinc-800">
          <Link
            href={editHref}
            className={cn(
              buttonVariants({ size: "sm", variant: "default" }),
              "gap-1 rounded-lg",
            )}
          >
            Continue
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          {sale.status === "published" ? (
            <Link
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-lg")}
            >
              View listing
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ hasAnySales }: { hasAnySales: boolean }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-border">
        <Home className="size-8 text-accent" aria-hidden />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {hasAnySales ? "No sales match filters" : "No sales yet"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasAnySales
          ? "Try clearing search or switching the status filter."
          : "Create a draft, add details, and publish when you’re ready."}
      </p>
      {!hasAnySales ? (
        <div className="mt-7">
          <CreateDraftSaleButton
            label="Create your first sale"
            className="rounded-xl px-6 shadow-sm"
          />
        </div>
      ) : null}
    </div>
  );
}
