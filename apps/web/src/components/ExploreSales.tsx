"use client";

import { useMemo, useState } from "react";

import SalesMap from "@/components/SalesMap";
import ActiveFilters from "@/components/explore-sales/ActiveFilters";
import EmptySales from "@/components/explore-sales/EmptySales";
import SaleCard, { type ExploreSale } from "@/components/explore-sales/SaleCard";
import StickyControlBar, {
  type DateRange,
  type SaleType,
  type ViewMode,
} from "@/components/explore-sales/StickyControlbar";
import MarketplaceCard from "@/components/shopper/MarketplaceCard";
import UniversalSaleSearch from "@/components/explore-sales/UniversalSaleSearch";
import {
  DEMO_MARKETPLACE_ITEMS,
  type MarketplaceItem,
} from "@/data/demo-marketplace-items";

type Props = {
  sales: ExploreSale[];
  initialCenter?: [number, number];
};

const distanceCycle = [5, 10, 25, 50, 100] as const;
const dateCycle: DateRange[] = ["all", "today", "weekend", "week", "month"];
const saleTypeCycle: SaleType[] = ["all", "company", "personal"];

export default function ExploreSales({
  sales,
  initialCenter = [33.749, -84.388],
}: Props) {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [location, setLocation] = useState("Sales near me");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [distance, setDistance] = useState<number>(25);
  const [saleType, setSaleType] = useState<SaleType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [marketplaceMode, setMarketplaceMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSales = useMemo(() => {
    let out = sales;

    if (saleType !== "all") {
      out = out.filter((s) => {
        const isCompany = Boolean(s.workspace_id && s.workspace_id !== s.created_by);
        return saleType === "company" ? isCompany : !isCompany;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      out = out.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          `${s.city}, ${s.state}`.toLowerCase().includes(q),
      );
    }

    return out;
  }, [sales, saleType, searchQuery]);

  const itemCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of DEMO_MARKETPLACE_ITEMS) {
      item.tags?.forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, []);

  const filteredItems = useMemo(() => {
    let out: MarketplaceItem[] = [...DEMO_MARKETPLACE_ITEMS];

    if (selectedCategory !== "all") {
      out = out.filter((i) => i.tags?.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q) ||
          i.saleTitle?.toLowerCase().includes(q) ||
          Boolean(i.tags?.some((t) => t.toLowerCase().includes(q))),
      );
    }

    return out;
  }, [searchQuery, selectedCategory]);

  const onCycleDistance = () => {
    const idx = distanceCycle.findIndex((d) => d === distance);
    const next = distanceCycle[(idx + 1) % distanceCycle.length] ?? 25;
    setDistance(next);
  };

  const onCycleDateRange = () => {
    const idx = dateCycle.findIndex((d) => d === dateRange);
    const next = dateCycle[(idx + 1) % dateCycle.length] ?? "all";
    setDateRange(next);
  };

  const onCycleSaleType = () => {
    const idx = saleTypeCycle.findIndex((t) => t === saleType);
    const next = saleTypeCycle[(idx + 1) % saleTypeCycle.length] ?? "all";
    setSaleType(next);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <StickyControlBar
        location={location}
        onChangeLocation={setLocation}
        onLocationClick={() => setViewMode("map")}
        isUpdatingLocation={false}
        dateRange={dateRange}
        distance={distance}
        saleType={saleType}
        onCycleDateRange={onCycleDateRange}
        onCycleDistance={onCycleDistance}
        onCycleSaleType={onCycleSaleType}
        viewMode={viewMode}
        marketplaceMode={marketplaceMode}
        onSetViewMode={setViewMode}
        onSetMarketplaceMode={setMarketplaceMode}
        salesCount={filteredSales.length}
        itemsCount={filteredItems.length}
      />

      <UniversalSaleSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        marketplaceMode={marketplaceMode}
        availableCategories={itemCategories}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {marketplaceMode ? (
          <>
            <div className="mb-6 flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-950/40">
              <p className="text-sm text-muted-foreground">
                Item previews from nearby sales · Within {distance} mi
              </p>
              <p className="text-sm font-semibold text-accent">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
                No items match your search. Try another category or keyword.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item) => (
                  <MarketplaceCard
                    key={item.itemId}
                    saleId={item.saleId}
                    itemId={item.itemId}
                    regionSlug={item.regionSlug}
                    listingSlug={item.listingSlug}
                    title={item.title}
                    description={item.description}
                    imageUrl={item.imageUrl}
                    tags={item.tags ?? []}
                    saleTitle={item.saleTitle}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {viewMode === "map" ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-white/60 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="h-[520px]">
                  <SalesMap
                    sales={filteredSales}
                    center={center}
                    distance={distance}
                    onCenterChange={(c) => {
                      setCenter(c);
                      setLocation(`${c[0].toFixed(3)}, ${c[1].toFixed(3)}`);
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div className={viewMode === "map" ? "mt-6" : ""}>
              <ActiveFilters
                filters={{ dateRange, saleType, distance }}
                salesCount={filteredSales.length}
              />
            </div>

            {filteredSales.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-border bg-white/70 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <EmptySales
                  title={
                    sales.length === 0
                      ? undefined
                      : "No matching sales"
                  }
                  subtitle={
                    sales.length === 0
                      ? undefined
                      : "Try another search or filter—or switch to list view to browse everything loaded."
                  }
                  showTips={sales.length === 0}
                />
              </div>
            ) : null}

            {viewMode === "list" && filteredSales.length > 0 ? (
              <div className="mt-8 grid gap-5">
                {filteredSales.map((s, index) => (
                  <SaleCard key={s.id} sale={s} priority={index < 3} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

