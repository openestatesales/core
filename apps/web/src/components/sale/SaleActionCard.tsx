"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CalendarRange,
  Clock,
  Heart,
  MapPin,
  Navigation,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  saleId: string;
  title: string;
  dateRange: string;
  previewTimes: string | null;
  city: string;
  state: string;
  zip: string | null;
  ended: boolean;
  addressIsExact: boolean;
  address: string | null;
  addressLine: string;
  lat: number | null;
  lng: number | null;
  onContact: () => void;
  className?: string;
};

const SAVED_KEY = "oes-saved-sales";

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

export function SaleActionCard({
  saleId,
  title,
  dateRange,
  previewTimes,
  city,
  state,
  zip,
  ended,
  addressIsExact,
  address,
  addressLine,
  lat,
  lng,
  onContact,
  className,
}: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(saleId));
  }, [saleId]);

  const toggleSave = () => {
    const ids = readSaved();
    const next = ids.includes(saleId)
      ? ids.filter((id) => id !== saleId)
      : [...ids, saleId];
    writeSaved(next);
    setSaved(next.includes(saleId));
  };

  const directionsHref =
    addressIsExact && address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      : typeof lat === "number" && typeof lng === "number"
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
        Estate sale
      </p>
      <p className="mt-1 line-clamp-2 text-base font-semibold text-stone-900">
        {title}
      </p>

      <div className="mt-4 space-y-3 text-sm text-stone-700">
        <div className="flex gap-2">
          <CalendarRange className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <span>{dateRange}</span>
        </div>

        {previewTimes?.trim() ? (
          <div className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            <span className="whitespace-pre-line">{previewTimes.trim()}</span>
          </div>
        ) : null}

        <div className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <span>
            {city}, {state}
            {zip ? ` ${zip}` : ""}
          </span>
        </div>

        {!ended ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
            {addressLine}
          </p>
        ) : (
          <p className="text-xs font-medium text-stone-500">This sale has ended.</p>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {!ended && !addressIsExact ? (
          <Button
            type="button"
            disabled
            title="Email alerts coming soon"
            className="h-10 w-full rounded-xl bg-amber-600/80 text-white opacity-90"
          >
            <Bell className="size-4" aria-hidden />
            Get address alert
          </Button>
        ) : null}

        {directionsHref && !ended ? (
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full rounded-xl border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100",
            )}
          >
            <Navigation className="size-4" aria-hidden />
            Get directions
          </a>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full rounded-xl border-stone-200",
            saved && "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
          )}
          onClick={toggleSave}
        >
          <Heart
            className={cn("size-4", saved && "fill-current")}
            aria-hidden
          />
          {saved ? "Saved" : "Save sale"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-xl border-stone-200"
          onClick={onContact}
        >
          Contact host
        </Button>
      </div>
    </div>
  );
}
