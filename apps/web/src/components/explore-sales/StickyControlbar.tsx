"use client";

import { LayoutGrid, Loader2, Map, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type DateRange = "all" | "today" | "weekend" | "week" | "month";
export type SaleType = "all" | "company" | "personal";
export type ViewMode = "list" | "map";

type StickyControlBarProps = {
  location: string;
  onChangeLocation: (value: string) => void;
  onSubmitLocation?: () => void;
  onFocusLocation?: () => void;
  isUpdatingLocation?: boolean;
  dateRange: DateRange;
  distance: number;
  saleType: SaleType;
  onCycleDateRange: () => void;
  onCycleDistance: () => void;
  onCycleSaleType: () => void;
  viewMode: ViewMode;
  onSetViewMode: (view: ViewMode) => void;
  salesCount: number;
  className?: string;
};

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition",
    active
      ? "bg-foreground text-background shadow-sm"
      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-zinc-900/80",
  );
}

export default function StickyControlBar({
  location,
  onChangeLocation,
  onSubmitLocation,
  onFocusLocation,
  isUpdatingLocation = false,
  dateRange,
  distance,
  saleType,
  onCycleDateRange,
  onCycleDistance,
  onCycleSaleType,
  viewMode,
  onSetViewMode,
  salesCount,
  className = "",
}: StickyControlBarProps) {
  const dateLabel =
    dateRange === "all"
      ? "Any date"
      : dateRange === "today"
        ? "Today"
        : dateRange === "weekend"
          ? "This weekend"
          : dateRange === "week"
            ? "This week"
            : "This month";

  const saleTypeLabel =
    saleType === "all" ? "All types" : saleType === "company" ? "Company" : "Private";

  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="text"
                value={location}
                onChange={(e) => onChangeLocation(e.target.value)}
                onFocus={onFocusLocation}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmitLocation?.();
                }}
                placeholder="City, neighborhood, or ZIP"
                className={cn(
                  "h-12 w-full rounded-full border border-border bg-muted/30 pl-11 pr-4 text-sm text-foreground",
                  "placeholder:text-muted-foreground",
                  "focus:border-accent focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/25",
                  "dark:bg-zinc-950/50",
                  isUpdatingLocation && "border-accent/50",
                )}
                aria-label="Search location"
                autoComplete="street-address"
              />
              {isUpdatingLocation ? (
                <Loader2
                  className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-accent"
                  aria-hidden
                />
              ) : null}
            </div>

            <div className="flex shrink-0 rounded-full border border-border bg-muted/40 p-1 dark:bg-zinc-900/60">
              <button
                type="button"
                onClick={() => onSetViewMode("list")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition",
                  viewMode === "list"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={viewMode === "list"}
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Browse</span>
              </button>
              <button
                type="button"
                onClick={() => onSetViewMode("map")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition",
                  viewMode === "map"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={viewMode === "map"}
              >
                <Map className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={onCycleDateRange}
                className={chipClass(dateRange !== "all")}
              >
                {dateLabel}
              </button>
              <button
                type="button"
                onClick={onCycleDistance}
                className={chipClass(distance !== 25)}
              >
                {distance} mi
              </button>
              <button
                type="button"
                onClick={onCycleSaleType}
                className={chipClass(saleType !== "all")}
              >
                {saleTypeLabel}
              </button>
            </div>
            <p
              className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {salesCount} sale{salesCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
