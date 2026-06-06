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
import { DashboardPageShell } from "@/components/operator/dashboard/DashboardPageShell";
import { buttonVariants } from "@/components/ui/button";
import {
  resolveSaleStatus,
  saleStatusLabel,
  saleStatusStyle,
  type SaleStatus,
} from "@/lib/sale-status";
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

type StatusFilter = "all" | SaleStatus;

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

function statusStyle(status: string, endDate: string): string {
  return saleStatusStyle(status, endDate);
}

function statusLabel(status: string, endDate: string): string {
  return saleStatusLabel(status, endDate);
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
      const displayStatus = resolveSaleStatus(s.status, s.end_date);
      const okStatus = status === "all" || displayStatus === status;
      const okSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.listing_slug.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [sales, status, search]);

  return (
    <DashboardPageShell
      title="Sales"
      description="Create drafts, publish listings, and manage your estate sales."
      width="wide"
      actions={
        <>
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
        </>
      }
    >
        {/* Search + status */}
        <div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
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
                    className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/25"
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
                    : "border-border bg-background text-muted-foreground hover:border-border hover:text-foreground",
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
    </DashboardPageShell>
  );
}

function SaleHubCard({ sale }: { sale: DashboardSaleRow }) {
  const displayStatus = resolveSaleStatus(sale.status, sale.end_date);
  const dates = formatRange(sale.start_date, sale.end_date);
  const publicHref = salePublicPath(sale.region_slug, sale.listing_slug);
  const editHref = `/dashboard/sales/${sale.id}/location`;
  const overviewHref = `/dashboard/sales/${sale.id}`;

  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-card shadow-sm transition hover:border-border hover:shadow-md">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 min-w-0 text-lg font-semibold leading-snug text-foreground">
            {sale.title}
          </h2>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
              statusStyle(sale.status, sale.end_date),
            )}
          >
            {statusLabel(sale.status, sale.end_date)}
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

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
          {displayStatus === "draft" ? (
            <Link
              href={editHref}
              className={cn(
                buttonVariants({ size: "sm", variant: "default" }),
                "gap-1 rounded-lg",
              )}
            >
              Continue editing
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href={overviewHref}
                className={cn(
                  buttonVariants({ size: "sm", variant: "default" }),
                  "rounded-lg",
                )}
              >
                View details
              </Link>
              <Link
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "rounded-lg",
                )}
              >
                View listing
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ hasAnySales }: { hasAnySales: boolean }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-border">
        <Home className="size-8 text-accent" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
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
