import Link from "next/link";
import { CalendarRange, ExternalLink, MapPin } from "lucide-react";

import type { OperatorSaleWizard } from "@/app/dashboard/actions";
import { DeleteSaleButton } from "@/components/operator/DeleteSaleButton";
import { buttonVariants } from "@/components/ui/button";
import {
  resolveSaleStatus,
  saleStatusLabel,
  saleStatusStyle,
} from "@/lib/sale-status";
import { cn } from "@/lib/utils";
import { salePublicPath } from "@/utils/sales";

type Props = {
  sale: OperatorSaleWizard;
};

function formatRange(start: string, end: string): string {
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const y = { year: "numeric" as const };
  if (start === end) {
    return a.toLocaleDateString("en-US", { ...opts, ...y });
  }
  return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", { ...opts, ...y })}`;
}

export function SaleOverviewPanel({ sale }: Props) {
  const displayStatus = resolveSaleStatus(sale.status, sale.end_date);
  const publicHref = salePublicPath(sale.region_slug, sale.listing_slug);
  const dates = formatRange(sale.start_date, sale.end_date);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-lg")}
        >
          ← Dashboard
        </Link>
        {displayStatus === "ended" ? <DeleteSaleButton saleId={sale.id} /> : null}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

        <div className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                  saleStatusStyle(sale.status, sale.end_date),
                )}
              >
                {saleStatusLabel(sale.status, sale.end_date)}
              </span>
              <h1 className="font-display text-2xl uppercase tracking-tight text-foreground sm:text-3xl">
                {sale.title}
              </h1>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
              {sale.city}, {sale.state}
            </p>
            {dates ? (
              <p className="flex items-center gap-2 text-foreground/90">
                <CalendarRange className="size-4 shrink-0 text-accent" aria-hidden />
                {dates}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground dark:bg-zinc-950/40">
            {displayStatus === "published" ? (
              <>
                This sale is <strong className="text-foreground">live</strong> on the public
                site. Listings can&apos;t be edited while they&apos;re live — buyers see a
                consistent listing until the sale ends.
              </>
            ) : (
              <>
                This sale has <strong className="text-foreground">ended</strong>. The listing
                stays on the site as a record, but it no longer appears in search or on the map.
                You can delete it from your dashboard if you no longer need it.
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Link
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "default" }),
                "gap-2 bg-accent font-semibold text-white hover:bg-accent/90",
              )}
            >
              View listing
              <ExternalLink className="size-4" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
