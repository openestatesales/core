"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { MapSale } from "@/components/SalesMap";
import SalesMap from "@/components/SalesMap";
import ActiveFilters from "@/components/explore-sales/ActiveFilters";
import EmptySales from "@/components/explore-sales/EmptySales";
import StickyControlBar, {
  type DateRange,
  type SaleType,
  type ViewMode,
} from "@/components/explore-sales/StickyControlbar";
import UniversalSaleSearch from "@/components/explore-sales/UniversalSaleSearch";
import { salePublicPath } from "@/utils/sales";

type ExploreSale = MapSale & {
  region_slug: string;
  listing_slug: string;
  city: string;
  state: string;
};

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
  const [location, setLocation] = useState("Choose location");
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
      {/* Your imported explore-sales controls are light-themed; keep them on a light strip. */}
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
        itemsCount={0}
      />

      <UniversalSaleSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        marketplaceMode={marketplaceMode}
        availableCategories={[]}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <ActiveFilters
          filters={{ dateRange, saleType, distance }}
          salesCount={filteredSales.length}
        />

        {filteredSales.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-8">
            <EmptySales />
          </div>
        ) : null}

        {/* Central map */}
        {viewMode === "map" ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40">
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

        {/* Results list */}
        {viewMode === "list" ? (
          <div className="mt-8 grid gap-3">
            {filteredSales.map((s) => (
              <Link
                key={s.id}
                href={salePublicPath(s.region_slug, s.listing_slug)}
                className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold text-zinc-100">{s.title}</h3>
                  <span className="text-xs text-zinc-500">
                    {s.city}, {s.state}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

