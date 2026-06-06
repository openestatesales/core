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
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Estate sale
      </p>
      <p className="mt-1 line-clamp-2 text-base font-semibold text-foreground">
        {title}
      </p>

      <div className="mt-4 space-y-3 text-sm text-foreground/85">
        <div className="flex gap-2">
          <CalendarRange className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <span>{dateRange}</span>
        </div>

        {previewTimes?.trim() ? (
          <div className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span className="whitespace-pre-line">{previewTimes.trim()}</span>
          </div>
        ) : null}

        <div className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <span>
            {city}, {state}
            {zip ? ` ${zip}` : ""}
          </span>
        </div>

        {!ended ? (
          <p className="rounded-xl bg-muted px-3 py-2.5 text-xs leading-relaxed text-accent-foreground">
            {addressLine}
          </p>
        ) : (
          <p className="text-xs font-medium text-muted-foreground">This sale has ended.</p>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {!ended && !addressIsExact ? (
          <Button
            type="button"
            disabled
            title="Email alerts coming soon"
            className="h-10 w-full rounded-xl"
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
              buttonVariants({ variant: "secondary" }),
              "h-10 w-full rounded-xl border-border",
            )}
          >
            <Navigation className="size-4" aria-hidden />
            Get directions
          </a>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          className={cn(
            "h-10 w-full rounded-xl border-border",
            saved && "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
          )}
          onClick={toggleSave}
        >
          <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
          {saved ? "Saved" : "Save sale"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="h-10 w-full rounded-xl border-border"
          onClick={onContact}
        >
          Contact host
        </Button>
      </div>
    </div>
  );
}
