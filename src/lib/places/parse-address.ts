/** Places API (New) `Place.addressComponents` row */
export type AddressComponent = {
  longText?: string;
  shortText?: string;
  types: string[];
};

function longName(c: AddressComponent): string {
  return c.longText ?? "";
}

function shortName(c: AddressComponent): string {
  return c.shortText ?? "";
}

/**
 * Extract city / state (USPS 2-letter) / zip from Google Places address components.
 * Places API (New) (`longText` / `shortText`).
 * https://developers.google.com/maps/documentation/javascript/places-migration-overview
 */
export function parseAddressComponents(
  components: AddressComponent[] | undefined,
): { city: string; state: string; zip: string | null } {
  let city = "";
  let state = "";
  let zip: string | null = null;

  if (!components?.length) {
    return { city: "Unknown", state: "GA", zip: null };
  }

  for (const c of components) {
    const types = c.types;
    if (types.includes("locality")) city = longName(c);
    if (types.includes("administrative_area_level_1")) state = shortName(c);
    if (types.includes("postal_code")) zip = longName(c);
  }

  if (!city) {
    for (const c of components) {
      if (
        c.types.includes("sublocality") ||
        c.types.includes("neighborhood") ||
        c.types.includes("administrative_area_level_2")
      ) {
        city = longName(c);
        break;
      }
    }
  }

  if (!city) city = "Unknown";
  if (!state || state.length !== 2) state = "GA";

  return { city, state, zip };
}
