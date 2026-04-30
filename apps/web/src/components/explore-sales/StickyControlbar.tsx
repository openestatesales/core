'use client';

export type DateRange = 'all' | 'today' | 'weekend' | 'week' | 'month';
export type SaleType = 'all' | 'company' | 'personal';
export type ViewMode = 'list' | 'map';

type StickyControlBarProps = {
  // Location (controlled)
  location: string;
  onChangeLocation: (value: string) => void;
  onSubmitLocation?: () => void;
  onFocusLocation?: () => void;
  isUpdatingLocation?: boolean;

  // Filters (controlled)
  dateRange: DateRange;
  distance: number; // miles
  saleType: SaleType;

  // Chip actions
  onCycleDateRange: () => void;
  onCycleDistance: () => void; // cycle [5,10,25,50,100]
  onCycleSaleType: () => void;

  // View (controlled)
  viewMode: ViewMode;
  marketplaceMode: boolean;
  onSetViewMode: (view: ViewMode) => void;
  onSetMarketplaceMode: (enabled: boolean) => void;

  // Counts
  salesCount: number;
  itemsCount: number;

  className?: string;
};

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
  marketplaceMode,
  onSetViewMode,
  onSetMarketplaceMode,
  salesCount,
  itemsCount,
  className = '',
}: StickyControlBarProps) {
  const dateLabel =
    dateRange === 'all'
      ? 'All Dates'
      : dateRange === 'today'
      ? 'Today'
      : dateRange === 'weekend'
      ? 'This Weekend'
      : dateRange === 'week'
      ? 'This Week'
      : dateRange === 'month'
      ? 'This Month'
      : dateRange;

  const saleTypeLabel =
    saleType === 'all' ? 'All Sales' : saleType === 'company' ? 'Company' : 'Personal';

  return (
    <div
      className={`sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md dark:border-zinc-800/90 dark:bg-surface/85 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Stack on mobile, row on md+ */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 py-2 md:py-3">
          {/* Location */}
          <div className="order-1 md:order-1 w-full md:flex-1 md:max-w-sm">
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => onChangeLocation(e.target.value)}
                onFocus={onFocusLocation}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmitLocation?.();
                }}
                placeholder="Address, city, or ZIP"
                className={`w-full rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-accent/[0.04] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:bg-zinc-950/70 ${
                  isUpdatingLocation ? "border-accent bg-accent/[0.06] dark:bg-zinc-950/80" : ""
                }`}
                aria-label="Location"
                autoComplete="street-address"
              />
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                {isUpdatingLocation ? (
                  <div className="w-4 h-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent" />
                  </div>
                ) : (
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Filter Chips (scrollable row on mobile) */}
          <div className="order-3 md:order-2 -mx-1 md:mx-0">
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto overscroll-x-contain px-1 [-webkit-overflow-scrolling:touch] md:overflow-visible">
              <button
                onClick={onCycleDateRange}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent/[0.04] dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950/70 md:py-1.5"
                type="button"
              >
                {dateLabel}
              </button>
              <button
                onClick={onCycleDistance}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent/[0.04] dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950/70 md:py-1.5"
                type="button"
              >
                {distance} mi
              </button>
              <button
                onClick={onCycleSaleType}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent/[0.04] dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:hover:bg-zinc-950/70 md:py-1.5"
                type="button"
              >
                {saleTypeLabel}
              </button>
            </div>
          </div>

          {/* Mobile: List | Map | Marketplace. Desktop (lg+): map+grid always — only Marketplace toggle. */}
          <div className="order-4 md:order-3 w-full md:w-auto">
            <div className="flex w-full rounded-lg border border-border bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/60 md:w-auto lg:inline-flex lg:min-w-0">
              <div className="flex flex-1 gap-0.5 lg:hidden">
                <button
                  onClick={() => {
                    onSetMarketplaceMode(false);
                    onSetViewMode("list");
                  }}
                  className={`min-w-0 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 md:py-1.5 ${
                    viewMode === "list" && !marketplaceMode
                      ? "bg-accent text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  }`}
                  type="button"
                  aria-pressed={viewMode === "list" && !marketplaceMode}
                >
                  List
                </button>
                <button
                  onClick={() => {
                    onSetMarketplaceMode(false);
                    onSetViewMode("map");
                  }}
                  className={`min-w-0 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 md:py-1.5 ${
                    viewMode === "map" && !marketplaceMode
                      ? "bg-accent text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  }`}
                  type="button"
                  aria-pressed={viewMode === "map" && !marketplaceMode}
                >
                  Map
                </button>
              </div>
              <button
                onClick={() => {
                  if (marketplaceMode) {
                    onSetMarketplaceMode(false);
                    onSetViewMode("map");
                  } else {
                    onSetMarketplaceMode(true);
                    onSetViewMode("list");
                  }
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 lg:px-5 md:py-1.5 ${
                  marketplaceMode
                    ? "bg-accent text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                } ${!marketplaceMode ? "max-lg:flex-1" : "w-full max-lg:flex-1"}`}
                type="button"
                aria-pressed={marketplaceMode}
              >
                {marketplaceMode ? "Estate sales" : "Marketplace"}
              </button>
            </div>
          </div>

          {/* Results Count (right on desktop, under controls on mobile) */}
          <div
            className="order-2 text-sm font-medium text-muted-foreground md:order-4 md:ml-auto"
            aria-live="polite"
          >
            {marketplaceMode ? `${itemsCount} items` : `${salesCount} sales`}
          </div>
        </div>
      </div>
    </div>
  );
}