'use client';

interface UniversalSaleSearchProps {
  // Search functionality
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Category functionality (marketplace only)
  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  // View context
  marketplaceMode: boolean;

  // Available categories (extracted from sale items)
  availableCategories: string[];

  className?: string;
}

export default function UniversalSaleSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  marketplaceMode,
  availableCategories,
  className = '',
}: UniversalSaleSearchProps) {
  const commonCategories = [
    'furniture',
    'clothing',
    'electronics',
    'books',
    'kitchen',
    'decor',
    'tools',
    'toys',
  ];

  const allCategories = Array.from(new Set([...commonCategories, ...availableCategories])).sort();

  return (
    <div
      className={`border-b border-border bg-surface/80 backdrop-blur-md dark:border-zinc-800/90 dark:bg-surface/70 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 space-y-3">
          {marketplaceMode && (
            <>
              {/* Search */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search items or tags..."
                  className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/40 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                  aria-label="Search sales and items"
                />
                <svg
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={() => onCategoryChange('all')}
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === "all"
                      ? "bg-accent text-zinc-950"
                      : "border border-zinc-200 bg-zinc-100/90 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  All
                </button>

                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                      selectedCategory === category
                        ? "bg-accent text-zinc-950"
                        : "border border-zinc-200 bg-zinc-100/90 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}