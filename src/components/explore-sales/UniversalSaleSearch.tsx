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
    <div className={`bg-white/70 backdrop-blur-sm border-b border-gray-100 ${className}`}>
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
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/80 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Search sales and items"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>

                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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