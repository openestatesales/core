import * as React from 'react';

type DateRange = 'today' | 'weekend' | 'week' | 'month' | 'all' | string;

export interface Filters {
  dateRange?: DateRange;
  saleType?: string;
  distance: number;
}

interface Props {
  filters: Filters;
  salesCount: number;
  className?: string;
}

const getDateRangeLabel = (v?: DateRange) => {
  if (!v) return '';
  return v === 'today'
    ? 'Today'
    : v === 'weekend'
    ? 'This Weekend'
    : v === 'week'
    ? 'This Week'
    : v === 'month'
    ? 'This Month'
    : v === 'all'
    ? 'Upcoming Sales'
    : v;
};

export default function ActiveFilters({ filters, salesCount, className = '' }: Props) {
  return (
    <div
      className={`mx-auto mb-4 rounded-xl border border-border bg-white/70 p-3 shadow-sm sm:mb-6 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950/40 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/90 sm:gap-4 sm:text-sm dark:text-zinc-200">
          {filters.dateRange && (
            <span className="rounded-full border border-zinc-200 bg-zinc-100/90 px-2 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
              {getDateRangeLabel(filters.dateRange)}
            </span>
          )}

          {filters.saleType !== 'all' && filters.saleType && (
            <span className="rounded-full border border-zinc-200 bg-zinc-100/90 px-2 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
              {filters.saleType === 'company' ? 'Company Sales' : 'Personal Sales'}
            </span>
          )}

          <span className="rounded-full border border-zinc-200 bg-zinc-100/90 px-2 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
            Within {filters.distance} miles
          </span>
        </div>

        <div className="text-xs sm:text-sm text-accent text-center sm:text-right font-semibold">
          {salesCount} sale{salesCount !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
}