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
      className={`mb-4 sm:mb-6 p-3 sm:p-4 mx-auto bg-indigo-50 border border-indigo-200 rounded-lg ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-indigo-800">
          <span className="font-medium">Active Filters:</span>

          {filters.dateRange && (
            <span className="px-2 py-1 bg-indigo-100 rounded-full text-xs">
              {getDateRangeLabel(filters.dateRange)}
            </span>
          )}

          {filters.saleType !== 'all' && filters.saleType && (
            <span className="px-2 py-1 bg-indigo-100 rounded-full text-xs">
              {filters.saleType === 'company' ? 'Company Sales' : 'Personal Sales'}
            </span>
          )}

          <span className="px-2 py-1 bg-indigo-100 rounded-full text-xs">
            Within {filters.distance} miles
          </span>
        </div>

        <div className="text-xs sm:text-sm text-indigo-600 text-center sm:text-right">
          {salesCount} sale{salesCount !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
}