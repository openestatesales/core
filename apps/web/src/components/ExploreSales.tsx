"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import SalesMap from "@/components/SalesMap";
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
  /** Optional hero — use on home page */
  heroTitle?: string;
  heroSubtitle?: string;
};

const distanceCycle = [5, 10, 25, 50, 100] as const;
const dateCycle: DateRange[] = ["all", "today", "weekend", "week", "month"];
const saleTypeCycle: SaleType[] = ["all", "company", "personal"];

export default function ExploreSales({
  sales,
  initialCenter = [33.749, -84.388],
  heroTitle,
  heroSubtitle,
}: Props) {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [distance, setDistance] = useState<number>(25);
  const [saleType, setSaleType] = useState<SaleType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
      {heroTitle ? (
        <header className="border-b border-border/60 bg-background px-4 py-10 sm:px-6 sm:py-12 md:py-14">
          <div className="mx-auto max-w-7xl">
            <h1 className="max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              {heroTitle}
            </h1>
            {heroSubtitle ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {heroSubtitle}
              </p>
            ) : null}
          </div>
        </header>
      ) : null}

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
              setViewMode("map");
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
      />

      {viewMode === "list" ? (
        <main className="flex-1 bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {filteredSales.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/90 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
                <EmptySales
                  title={sales.length === 0 ? undefined : "No matching sales"}
                  subtitle={
                    sales.length === 0
                      ? undefined
                      : "Try another location or loosen your filters."
                  }
                  showTips={sales.length === 0}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-3 sm:gap-4",
                  "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
                )}
              >
                {filteredSales.map((s, index) => (
                  <SaleCard
                    key={s.id}
                    sale={s}
                    variant="editorial"
                    priority={index < 8}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      ) : (
        <div
          className={cn(
            "relative min-h-[min(720px,calc(100dvh-11rem))] flex-1 bg-zinc-950",
            "lg:min-h-[min(820px,calc(100dvh-12rem))]",
          )}
        >
          <SalesMap
            sales={filteredSales}
            center={center}
            distance={distance}
            onCenterChange={(c) => {
              setCenter(c);
            }}
          />
        </div>
      )}
    </div>
  );
}
