"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import SalesMap from "@/components/SalesMap";
import ActiveFilters from "@/components/explore-sales/ActiveFilters";
import EmptySales from "@/components/explore-sales/EmptySales";
import SaleCard, { type ExploreSale } from "@/components/explore-sales/SaleCard";
import StickyControlBar, {
  type DateRange,
  type SaleType,
  type ViewMode,
} from "@/components/explore-sales/StickyControlbar";
import { cn } from "@/lib/utils";
import { geocodeLocation } from "@/utils/googleMaps";

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
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [distance, setDistance] = useState<number>(25);
  const [saleType, setSaleType] = useState<SaleType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const geocodeSeq = useRef(0);
  const lastGeocodedQuery = useRef<string>("");

  const filteredSales = useMemo(() => {
    let out = sales;

    if (saleType !== "all") {
      out = out.filter((s) => {
        const isCompany =
          s.operator_kind === "company" ||
          Boolean(s.workspace_id && s.workspace_id !== s.created_by);
        return saleType === "company" ? isCompany : !isCompany;
      });
    }

    return out;
  }, [sales, saleType]);

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

  useEffect(() => {
    const q = location.trim();
    if (q.length < 3) return;

    const canonical = q.toLowerCase();
    if (canonical === lastGeocodedQuery.current) return;

    const handle = window.setTimeout(() => {
      const seq = ++geocodeSeq.current;
      setIsUpdatingLocation(true);

      geocodeLocation(q)
        .then(({ center: nextCenter, label }) => {
          if (seq !== geocodeSeq.current) return;
          setCenter(nextCenter);
          setLocation(label);
          lastGeocodedQuery.current = label.trim().toLowerCase();
        })
        .catch(() => {
          // Keep input unchanged; geocode failures shouldn't interrupt typing.
        })
        .finally(() => {
          if (seq === geocodeSeq.current) setIsUpdatingLocation(false);
        });
    }, 600);

    return () => window.clearTimeout(handle);
  }, [location]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StickyControlBar
        location={location}
        onChangeLocation={setLocation}
        onFocusLocation={() => setViewMode("map")}
        onSubmitLocation={() => {
          lastGeocodedQuery.current = "";
          const seq = ++geocodeSeq.current;
          setIsUpdatingLocation(true);

          geocodeLocation(location)
            .then(({ center: nextCenter, label }) => {
              if (seq !== geocodeSeq.current) return;
              setCenter(nextCenter);
              setLocation(label);
              lastGeocodedQuery.current = label.trim().toLowerCase();
            })
            .catch(() => {
              // noop
            })
            .finally(() => {
              if (seq === geocodeSeq.current) setIsUpdatingLocation(false);
            });
        }}
        isUpdatingLocation={isUpdatingLocation}
        dateRange={dateRange}
        distance={distance}
        saleType={saleType}
        onCycleDateRange={onCycleDateRange}
        onCycleDistance={onCycleDistance}
        onCycleSaleType={onCycleSaleType}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        salesCount={filteredSales.length}
        itemsCount={0}
      />

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          "lg:min-h-[min(900px,calc(100dvh-7.5rem))] lg:flex-row",
        )}
      >
        {/* Map — left; full-width on mobile when map mode */}
        <div
          className={cn(
            "relative min-h-[48vh] w-full min-w-0 bg-muted lg:min-h-0 lg:flex-[1.2_1_0%]",
            viewMode === "list" && "hidden lg:block",
          )}
        >
          <div className="absolute inset-0 min-h-[48vh] lg:min-h-full">
            <SalesMap
              sales={filteredSales}
              center={center}
              distance={distance}
              onCenterChange={(c) => {
                setCenter(c);
              }}
            />
          </div>
        </div>

        {/* Results — right; 2×n grid on lg+; full-width list on mobile */}
        <aside
          className={cn(
            "flex w-full flex-col overflow-hidden border-t border-border bg-background",
            "lg:w-[min(100%,440px)] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[min(100%,500px)]",
            viewMode === "map" && "hidden max-h-none lg:flex",
          )}
        >
          <div className="shrink-0 border-b border-border bg-background/95 px-2 py-1.5 backdrop-blur-sm sm:px-3 lg:sticky lg:top-0 lg:z-10">
            <ActiveFilters
              filters={{ dateRange, saleType, distance }}
              salesCount={filteredSales.length}
              className="mb-0 rounded-lg border-0 bg-transparent p-2 shadow-none sm:p-3"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-8 pt-2 sm:px-3">
            {filteredSales.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 sm:p-6">
                <EmptySales
                  title={sales.length === 0 ? undefined : "No matching sales"}
                  subtitle={
                    sales.length === 0
                      ? undefined
                      : "Try another search or loosen filters."
                  }
                  showTips={sales.length === 0}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {filteredSales.map((s, index) => (
                  <SaleCard
                    key={s.id}
                    sale={s}
                    variant="grid"
                    priority={index < 8}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
