import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarRange, ChevronRight, MapPin, User } from "lucide-react";

import type { MapSale } from "@/components/SalesMap";
import { salePublicPath } from "@/utils/sales";
import { cn } from "@/lib/utils";

/** Sale row used on /sales explore list + map markers */
export type ExploreSale = MapSale & {
  region_slug: string;
  listing_slug: string;
  city: string;
  state: string;
};

function isCompanySale(sale: MapSale): boolean {
  if (sale.operator_kind === "company") return true;
  if (sale.operator_kind === "individual") return false;
  return Boolean(sale.workspace_id && sale.workspace_id !== sale.created_by);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

function formatSaleDateSummary(dates?: { sale_date: string }[]): string | null {
  if (!dates?.length) return null;
  const sorted = [...dates].sort((a, b) => a.sale_date.localeCompare(b.sale_date));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const a = formatShortDate(first.sale_date);
  const b = formatShortDate(last.sale_date);
  return a === b ? a : `${a} – ${b}`;
}

type SaleCardProps = {
  sale: ExploreSale;
  priority?: boolean;
  className?: string;
  /** Photo-first tile for browse grids. `default` = full-width row card. */
  variant?: "default" | "grid" | "editorial";
};

export default function SaleCard({
  sale,
  priority,
  className,
  variant = "default",
}: SaleCardProps) {
  const href = sale.href ?? salePublicPath(sale.region_slug, sale.listing_slug);
  const company = isCompanySale(sale);
  const dateSummary = formatSaleDateSummary(sale.sale_dates);
  const imageSrc = sale.main_display_image?.trim() || "/placeholder.svg";

  if (variant === "grid" || variant === "editorial") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-2xl bg-zinc-900 shadow-sm ring-1 ring-black/5 transition",
          "hover:shadow-lg hover:ring-accent/30 dark:ring-white/10",
          className,
        )}
      >
        <div className="relative aspect-[4/5] bg-muted">
          <Image
            src={imageSrc}
            alt={sale.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            priority={priority}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5"
            aria-hidden
          />
          {company ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
              <Building2 className="size-3" aria-hidden />
              Company
            </span>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
            <h3 className="font-display text-base uppercase leading-tight tracking-tight text-white sm:text-lg">
              {sale.title}
            </h3>
            <div className="mt-2 space-y-0.5 text-[11px] text-white/75 sm:text-xs">
              <p className="flex items-center gap-1">
                <MapPin className="size-3 shrink-0" aria-hidden />
                {sale.city}, {sale.state}
              </p>
              {dateSummary ? (
                <p className="flex items-center gap-1">
                  <CalendarRange className="size-3 shrink-0" aria-hidden />
                  {dateSummary}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-border bg-white/80 shadow-sm transition",
        "hover:border-accent/35 hover:bg-accent/[0.03]",
        "dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-accent/40 dark:hover:bg-zinc-950/70",
        className,
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="relative aspect-[16/10] bg-zinc-200 dark:bg-zinc-900 lg:aspect-auto lg:min-h-[200px]">
          <Image
            src={imageSrc}
            alt={sale.title}
            fill
            sizes="(min-width: 1024px) 280px, 100vw"
            className="object-cover transition duration-300 group-hover:opacity-95"
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-black/10 dark:ring-black/20",
              company
                ? "bg-zinc-900/90 text-accent dark:bg-zinc-950/90"
                : "bg-white/95 text-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-100",
            )}
          >
            {company ? (
              <>
                <Building2 className="size-3.5" aria-hidden />
                Company
              </>
            ) : (
              <>
                <User className="size-3.5" aria-hidden />
                Private seller
              </>
            )}
          </span>
        </div>

        <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
              {sale.title}
            </h3>

            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
              <span>
                {sale.city}, {sale.state}
              </span>
            </p>

            {sale.addressVisible === false ? (
              <p className="text-xs text-muted-foreground">
                Street address is hidden until the scheduled reveal time.
              </p>
            ) : null}

            {dateSummary ? (
              <p className="flex items-center gap-2 text-sm text-foreground/85 dark:text-zinc-300">
                <CalendarRange className="size-4 shrink-0 text-accent" aria-hidden />
                <span>{dateSummary}</span>
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4 dark:border-zinc-800/80">
            <span className="text-xs text-muted-foreground">Open estate sale listing</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
              View details
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
