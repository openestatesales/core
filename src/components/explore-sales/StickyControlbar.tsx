'use client';

export type DateRange = 'all' | 'today' | 'weekend' | 'week' | 'month';
export type SaleType = 'all' | 'company' | 'personal';
export type ViewMode = 'list' | 'map';

type StickyControlBarProps = {
  // Location (controlled)
  location: string;
  onChangeLocation: (value: string) => void;
  onLocationClick?: () => void; // open map
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
  onLocationClick,
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
          <div className="order-1 md:order-1 w-full md:flex-1 md:max-w-xs">
            <div className="relative">
              <input
                type="text"
                value={location}
                readOnly
                onClick={onLocationClick}
                placeholder="City, state, or ZIP"
                className={`w-full cursor-pointer rounded-lg border border-border bg-background px-3 py-2 pl-8 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:bg-accent/[0.04] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:bg-zinc-950/70 ${
                  isUpdatingLocation ? "border-accent bg-accent/[0.06] dark:bg-zinc-950/80" : ""
                }`}
                aria-label="Location"
                title="Tap to choose location on map"
              />
              {isUpdatingLocation ? (
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent" />
                </div>
              ) : (
                <svg
                  className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Filter Chips (scrollable row on mobile) */}
          <div className="order-3 md:order-2 -mx-1 md:mx-0">
            <div
              className="flex items-center gap-2 overflow-x-auto md:overflow-visible px-1"
              style={{ scrollbarWidth: 'none' } as React.CSSProperties}
            >
              <button
                onClick={onCycleDateRange}
                className="rounded-full border border-zinc-200 bg-zinc-100/90 px-3 py-2 text-sm font-medium whitespace-nowrap text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900 md:py-1.5"
                type="button"
              >
                {dateLabel}
              </button>
              <button
                onClick={onCycleDistance}
                className="rounded-full border border-zinc-200 bg-zinc-100/90 px-3 py-2 text-sm font-medium whitespace-nowrap text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900 md:py-1.5"
                type="button"
              >
                {distance} mi
              </button>
              <button
                onClick={onCycleSaleType}
                className="rounded-full border border-zinc-200 bg-zinc-100/90 px-3 py-2 text-sm font-medium whitespace-nowrap text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900 md:py-1.5"
                type="button"
              >
                {saleTypeLabel}
              </button>
            </div>
          </div>

          {/* View Toggle (full width segmented on mobile) */}
          <div className="order-4 md:order-3 w-full md:w-auto">
            <div className="flex w-full rounded-lg border border-border bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/60 md:w-auto">
              <button
                onClick={() => {
                  onSetMarketplaceMode(false);
                  onSetViewMode('list');
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 md:flex-none md:py-1.5 ${
                  viewMode === "list" && !marketplaceMode
                    ? "bg-accent text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                }`}
                type="button"
                aria-pressed={viewMode === 'list' && !marketplaceMode}
              >
                List
              </button>
              <button
                onClick={() => {
                  onSetMarketplaceMode(false);
                  onSetViewMode('map');
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 md:flex-none md:py-1.5 ${
                  viewMode === "map" && !marketplaceMode
                    ? "bg-accent text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                }`}
                type="button"
                aria-pressed={viewMode === 'map' && !marketplaceMode}
              >
                Map
              </button>
              <button
                onClick={() => {
                  onSetMarketplaceMode(true);
                  onSetViewMode('list');
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 md:flex-none md:py-1.5 ${
                  marketplaceMode
                    ? "bg-accent text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                }`}
                type="button"
                aria-pressed={marketplaceMode}
              >
                Marketplace
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