"use client";

import {
  updateSaleLocation,
  type SaleLocationRow,
} from "@/app/operator/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  parseAddressComponents,
  type AddressComponent,
} from "@/lib/places/parse-address";
import { cn } from "@/lib/utils";
import { loadGoogleMaps } from "@/utils/googleMaps";
import { AlertCircle, Clock, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

type Props = {
  saleId: string;
  initial: SaleLocationRow;
};

/** gmp-select payload; @types/google.maps may not include the new widget yet. */
type PlacePredictionSelectEvent = Event & {
  placePrediction: { toPlace: () => PlaceAfterToPlace };
};

/** Minimal shape after `toPlace()` + `fetchFields` for Places API (New). */
type PlaceAfterToPlace = {
  fetchFields: (opts: { fields: string[] }) => Promise<unknown>;
  formattedAddress?: string;
  location?: google.maps.LatLng;
  addressComponents?: AddressComponent[];
};

type PlaceAutocompleteConstructor = new (options?: {
  includedRegionCodes?: string[];
  placeholder?: string;
  name?: string;
}) => HTMLElement & { value: string };

type PlacesLibraryModule = {
  PlaceAutocompleteElement: PlaceAutocompleteConstructor;
};

function readTrimmedAddressFromWidget(
  el: HTMLElement | null,
  fallback: string,
): string {
  if (!el) return fallback.trim();
  const v = (el as HTMLElement & { value?: string }).value;
  return typeof v === "string" ? v.trim() : fallback.trim();
}

export default function SaleLocationForm({ saleId, initial }: Props) {
  const router = useRouter();
  const [address, setAddress] = useState(initial.address ?? "");
  const [latitude, setLatitude] = useState<number | null>(initial.lat);
  const [longitude, setLongitude] = useState<number | null>(initial.lng);
  const [placeMeta, setPlaceMeta] = useState<{
    city: string;
    state: string;
    zip: string | null;
  }>({
    city: initial.city,
    state: initial.state,
    zip: initial.zip,
  });
  const [availableAt, setAvailableAt] = useState(
    isoToDatetimeLocal(initial.address_reveal_at),
  );

  const [mapsLoading, setMapsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLElement | null>(null);

  const currentAddress = (initial.address ?? "").trim();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const initialLine = initial.address ?? "";

    const init = async () => {
      try {
        setMapsLoading(true);
        setError(null);
        await loadGoogleMaps();
        if (cancelled) return;

        const placesLib = (await google.maps.importLibrary(
          "places",
        )) as unknown as PlacesLibraryModule;

        const { PlaceAutocompleteElement } = placesLib;

        // Places API (New) widget — https://developers.google.com/maps/documentation/javascript/places-migration-overview
        const ac = new PlaceAutocompleteElement({
          includedRegionCodes: ["us"],
          placeholder: "Start typing…",
          name: "address",
        });
        ac.id = "sale-address";
        ac.value = initialLine;

        const onInput = () => {
          setAddress((ac as HTMLElement & { value: string }).value);
        };

        const onSelect = async (e: Event) => {
          const { placePrediction } = e as PlacePredictionSelectEvent;
          const place = placePrediction.toPlace() as PlaceAfterToPlace;
          try {
            await place.fetchFields({
              fields: ["formattedAddress", "location", "addressComponents"],
            });
          } catch (err) {
            console.error(err);
            setError("Could not load place details. Try again.");
            return;
          }

          if (!place.formattedAddress || !place.location) {
            setError("Select a valid address from the suggestions.");
            return;
          }

          setAddress(place.formattedAddress);
          setLatitude(place.location.lat());
          setLongitude(place.location.lng());
          setPlaceMeta(parseAddressComponents(place.addressComponents));
          setError(null);
        };

        const onGmpError = () => {
          setError(
            "Address search failed. Check your API key and that Places API (New) is enabled for this project.",
          );
        };

        ac.addEventListener("input", onInput);
        ac.addEventListener("gmp-select", onSelect);
        ac.addEventListener("gmp-error", onGmpError);

        if (cancelled) return;
        container.appendChild(ac);
        autocompleteRef.current = ac;
      } catch (e) {
        console.error(e);
        setError("Could not load Google Maps. Check your API key and network.");
      } finally {
        if (!cancelled) setMapsLoading(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
      const ac = autocompleteRef.current;
      if (ac && container.contains(ac)) {
        container.removeChild(ac);
      }
      autocompleteRef.current = null;
    };
  }, [initial.address]);

  const coordsOk = (lat: number | null | undefined, lng: number | null | undefined) =>
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  const handleSave = async () => {
    const trimmed = readTrimmedAddressFromWidget(autocompleteRef.current, address);

    if (!trimmed) {
      setError("Enter a sale address.");
      return;
    }

    const addressChanged = trimmed !== currentAddress;
    const finalLat = latitude ?? initial.lat;
    const finalLng = longitude ?? initial.lng;

    if (addressChanged && !coordsOk(latitude, longitude)) {
      setError("Choose an address from the suggestions so we get accurate coordinates.");
      return;
    }

    if (!coordsOk(finalLat, finalLng)) {
      setError("We need coordinates for this address. Pick from the dropdown.");
      return;
    }

    if (!availableAt) {
      setError("Set when the address becomes visible to shoppers.");
      return;
    }

    setError(null);
    setSaving(true);

    const result = await updateSaleLocation({
      saleId,
      address: trimmed,
      latitude: finalLat as number,
      longitude: finalLng as number,
      city: placeMeta.city,
      state: placeMeta.state,
      zip: placeMeta.zip,
      addressRevealAt: datetimeLocalToIso(availableAt),
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/operator");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Draft · {initial.title}
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
        Sale location
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set the street address, map coordinates, and when buyers can see the full
        address.
      </p>

      <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <MapPin className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Address &amp; map pin</h2>
            <p className="text-sm text-muted-foreground">
              US addresses only. Pick from Google&apos;s list for accurate geocoding.
            </p>
          </div>
        </div>

        {error ? (
          <div
            className="flex gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="sale-address" className="text-sm font-medium text-foreground">
            Street address
          </label>
          <div
            ref={containerRef}
            className={cn(
              "sale-location-place-autocomplete min-h-10 w-full",
              mapsLoading && "pointer-events-none opacity-50",
            )}
          />
          <p className="text-xs text-muted-foreground">
            {mapsLoading ? "Loading address search…" : "Select a suggestion to lock coordinates."}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Visibility</p>
          <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-4 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2 text-accent">
              <Clock className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold text-foreground">
                Scheduled reveal
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Exact address stays hidden until this time; the map uses a fuzzy pin
              (~0.5 mi) before then.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="reveal-at" className="text-sm font-medium text-foreground">
            Address visible to buyers at
          </label>
          <Input
            id="reveal-at"
            type="datetime-local"
            value={availableAt}
            onChange={(e) => setAvailableAt(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground dark:bg-zinc-950/50">
          <strong className="text-foreground">Privacy:</strong> the public map shows an
          approximate location until reveal time; exact coordinates are stored for
          your dashboard and for after reveal.
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/operator"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button
            onClick={() => void handleSave()}
            disabled={saving || mapsLoading}
            className="bg-accent font-semibold text-zinc-950 hover:bg-accent/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save location"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
