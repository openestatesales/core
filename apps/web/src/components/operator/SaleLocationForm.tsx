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
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  EyeOff,
  Landmark,
  Loader2,
  MapPin,
  Package,
  Phone,
  Tag,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
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

function getRevealCountdown(datetimeLocal: string): string | null {
  if (!datetimeLocal) return null;
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return "Address is live now";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Buyers see the exact address in ${days}d ${hours}h`;
  if (hours > 0) return `Buyers see the exact address in ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `Buyers see the exact address in ${mins}m`;
}

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

const SALE_KIND_ICONS: Record<SaleKindValue, LucideIcon> = {
  estate_sale: Landmark,
  moving_sale: Package,
  warehouse_estate_sale: Warehouse,
  business_closing: Building2,
};

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

      <div className="p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-tight text-foreground">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {children}
    </label>
  );
}

function PhoneOptionCard({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-150",
        checked
          ? "border-accent bg-accent/[0.06] shadow-sm"
          : "border-border bg-transparent hover:border-accent/40 hover:bg-accent/[0.03]",
      )}
    >
      <input
        type="radio"
        name="phone-display"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 accent-accent"
      />
      <div>
        <p className="text-sm font-medium leading-tight text-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
      </div>
      {checked ? (
        <CheckCircle2 className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-accent" />
      ) : null}
    </label>
  );
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
  const revealCountdown = getRevealCountdown(availableAt);

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
          placeholder: "123 Main St — we'll lock the pin automatically",
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
      description="Name your sale, set the type, contact preferences, and reveal timing."
    >
      <div className="mx-auto mt-6 w-full max-w-2xl">
        {error ? (
          <div
            className="mb-5 flex gap-2.5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <SectionCard
            icon={<Tag className="h-5 w-5" />}
            title="Sale identity"
            description="Give your sale a name and tell buyers what kind of event it is."
          >
            <div>
              <FieldLabel htmlFor="sale-name">Sale name</FieldLabel>
              <Input
                id="sale-name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mid-century estate — tools & furniture"
                autoComplete="off"
                className="h-11 text-sm"
              />
            </div>

            <div>
              <FieldLabel>Type of sale</FieldLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SALE_KIND_OPTIONS.map((option) => {
                  const KindIcon = SALE_KIND_ICONS[option.value];
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSaleKind(option.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-150",
                        saleKind === option.value
                          ? "border-accent bg-accent/10 text-accent shadow-sm ring-1 ring-accent/30"
                          : "border-border bg-transparent text-muted-foreground hover:border-accent/40 hover:bg-accent/[0.04] hover:text-foreground",
                      )}
                    >
                      <KindIcon className="h-5 w-5" aria-hidden />
                      <span className="text-center text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Phone className="h-5 w-5" />}
            title="Contact preferences"
            description="Choose how buyers can reach you about this sale."
          >
            <div className="space-y-2">
              <PhoneOptionCard
                label="Show my account phone"
                sublabel="Displays the number on your profile to interested buyers"
                checked={phoneDisplay === "show_account"}
                onChange={() => setPhoneDisplay("show_account")}
              />
              <PhoneOptionCard
                label="Don't show a phone number"
                sublabel="Buyers contact you through the platform only"
                checked={phoneDisplay === "hidden"}
                onChange={() => setPhoneDisplay("hidden")}
              />
              <PhoneOptionCard
                label="Show a custom number"
                sublabel="Use a different number specific to this sale"
                checked={phoneDisplay === "custom"}
                onChange={() => setPhoneDisplay("custom")}
              />
            </div>

            {phoneDisplay === "custom" ? (
              <div>
                <FieldLabel htmlFor="custom-phone">Custom phone number</FieldLabel>
                <Input
                  id="custom-phone"
                  type="tel"
                  value={contactPhoneCustom}
                  onChange={(e) => setContactPhoneCustom(e.target.value)}
                  placeholder="(404) 555-0100"
                  autoComplete="tel"
                  className="h-11 text-sm"
                />
              </div>
            ) : null}

            <div>
              <FieldLabel htmlFor="directions-parking">Directions & parking</FieldLabel>
              <textarea
                id="directions-parking"
                value={directionsParking}
                onChange={(e) => setDirectionsParking(e.target.value)}
                rows={3}
                placeholder="Parking rules, which entrance to use, neighborhood notes…"
                className={cn(
                  "w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm outline-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
                  "dark:bg-input/30",
                )}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={<MapPin className="h-5 w-5" />}
            title="Address & reveal timing"
            description="US addresses only. The exact pin stays hidden until your reveal time."
          >
            <div>
              <FieldLabel htmlFor="sale-address">Street address</FieldLabel>
              <div
                ref={containerRef}
                className={cn(
                  "sale-location-place-autocomplete min-h-11 w-full rounded-xl",
                  mapsLoading && "pointer-events-none opacity-50",
                )}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {mapsLoading
                  ? "Loading address search…"
                  : "Select a suggestion to lock coordinates."}
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="reveal-at">Address visible to buyers at</FieldLabel>
              <Input
                id="reveal-at"
                type="datetime-local"
                value={availableAt}
                onChange={(e) => setAvailableAt(e.target.value)}
                className="h-11 text-sm"
              />
            </div>

            {revealCountdown ? (
              <div className="flex items-center gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {revealCountdown}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fuzzy pin (~0.5 mi) shown before reveal
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-zinc-950/40">
              <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Privacy:</span>{" "}
                Exact coordinates are stored securely for your dashboard. The public map shows an
                approximate location until reveal time.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button
            onClick={() => void handleNext()}
            disabled={basicsMutation.isPending || mapsLoading}
            className="h-11 bg-accent px-8 text-sm font-semibold text-white hover:bg-accent/90"
          >
            {basicsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Next →"
            )}
          </Button>
        </div>
      </div>
    </OperatorSaleWizardShell>
  );
}
