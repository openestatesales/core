"use client";

import { updateSaleBasics } from "@/apis/data/sales-client";
import type { OperatorSaleWizard } from "@/app/dashboard/actions";
import { OperatorSaleWizardShell } from "@/components/operator/OperatorSaleWizardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saleStepBasicsSchema } from "@/form-schemas/sale";
import {
  isSaleKind,
  type SaleKindValue,
  SALE_KIND_OPTIONS,
} from "@/lib/sale-kinds";
import {
  parseAddressComponents,
  type AddressComponent,
} from "@/lib/places/parse-address";
import { cn } from "@/lib/utils";
import { loadGoogleMaps } from "@/utils/googleMaps";
import { useMutation } from "@tanstack/react-query";
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
  initial: OperatorSaleWizard;
};

type PlacePredictionSelectEvent = Event & {
  placePrediction: { toPlace: () => PlaceAfterToPlace };
};

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

type PhoneDisplay = "show_account" | "hidden" | "custom";

function parsePhoneDisplay(raw: string): PhoneDisplay {
  if (raw === "show_account" || raw === "hidden" || raw === "custom") {
    return raw;
  }
  return "hidden";
}

export default function SaleLocationForm({ saleId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(() =>
    initial.title === "Untitled sale" ? "" : initial.title,
  );
  const [saleKind, setSaleKind] = useState<SaleKindValue>(() =>
    isSaleKind(initial.sale_kind) ? initial.sale_kind : "estate_sale",
  );
  const [phoneDisplay, setPhoneDisplay] = useState<PhoneDisplay>(() =>
    parsePhoneDisplay(initial.phone_display),
  );
  const [contactPhoneCustom, setContactPhoneCustom] = useState(
    initial.contact_phone_custom ?? "",
  );
  const [directionsParking, setDirectionsParking] = useState(
    initial.directions_parking ?? "",
  );

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
  const [error, setError] = useState<string | null>(null);

  const basicsMutation = useMutation({
    mutationFn: updateSaleBasics,
  });

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

  const handleNext = () => {
    const trimmed = readTrimmedAddressFromWidget(autocompleteRef.current, address);

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

    const parsed = saleStepBasicsSchema.safeParse({
      title,
      saleKind,
      phoneDisplay,
      contactPhoneCustom:
        phoneDisplay === "custom" ? contactPhoneCustom.trim() : null,
      directionsParking: directionsParking.trim() || null,
      address: trimmed,
      latitude: finalLat as number,
      longitude: finalLng as number,
      city: placeMeta.city,
      state: placeMeta.state,
      zip: placeMeta.zip,
      addressRevealAt: datetimeLocalToIso(availableAt),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    setError(null);

    basicsMutation.mutate(
      {
        saleId,
        title: parsed.data.title,
        saleKind: parsed.data.saleKind,
        phoneDisplay: parsed.data.phoneDisplay,
        contactPhoneCustom: parsed.data.contactPhoneCustom,
        directionsParking: parsed.data.directionsParking,
        address: parsed.data.address,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        city: parsed.data.city,
        state: parsed.data.state,
        zip: parsed.data.zip,
        addressRevealAt: parsed.data.addressRevealAt,
      },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push(`/dashboard/sales/${saleId}/details`);
          router.refresh();
        },
      },
    );
  };

  return (
    <OperatorSaleWizardShell
      saleId={saleId}
      draftTitle={initial.title === "Untitled sale" ? "Draft" : initial.title}
      heading="Basics & location"
      description="Name your sale, choose the type, contact preferences, directions, and the street address buyers will see after reveal."
    >
      <div className="mt-8 w-full space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
          <label htmlFor="sale-name" className="text-sm font-medium text-foreground">
            Sale name
          </label>
          <Input
            id="sale-name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. Mid-century estate — tools & furniture"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sale-kind" className="text-sm font-medium text-foreground">
            Type of sale
          </label>
          <select
            id="sale-kind"
            value={saleKind}
            onChange={(e) => {
              const v = e.target.value;
              if (isSaleKind(v)) setSaleKind(v);
            }}
            className={cn(
              "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
            )}
          >
            {SALE_KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Phone on listing</legend>
          <div className="space-y-2">
            {(
              [
                ["show_account", "Show my account phone"],
                ["hidden", "Don’t show a phone"],
                ["custom", "Show a custom number"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="phone-display"
                  checked={phoneDisplay === value}
                  onChange={() => setPhoneDisplay(value)}
                  className="accent-accent"
                />
                {label}
              </label>
            ))}
          </div>
          {phoneDisplay === "custom" ? (
            <Input
              type="tel"
              value={contactPhoneCustom}
              onChange={(e) => setContactPhoneCustom(e.target.value)}
              placeholder="e.g. (404) 555-0100"
              autoComplete="tel"
            />
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="directions-parking" className="text-sm font-medium text-foreground">
            Directions &amp; parking
          </label>
          <textarea
            id="directions-parking"
            value={directionsParking}
            onChange={(e) => setDirectionsParking(e.target.value)}
            rows={4}
            placeholder="Parking rules, which entrance to use, neighborhood notes…"
            className={cn(
              "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
            )}
          />
        </div>

        <div className="flex items-start gap-3 border-t border-border pt-6">
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
              Exact address stays hidden until this time; the map uses a fuzzy pin (~0.5 mi) before
              then.
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
          <strong className="text-foreground">Privacy:</strong> the public map shows an approximate
          location until reveal time; exact coordinates are stored for your dashboard and for after
          reveal.
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button
            onClick={() => void handleNext()}
            disabled={basicsMutation.isPending || mapsLoading}
            className="bg-accent font-semibold text-white hover:bg-accent/90"
          >
            {basicsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </OperatorSaleWizardShell>
  );
}
