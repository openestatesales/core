/**
 * Generate a SEO-friendly slug path for a sale.
 * Format: `{city}-{state}/{title-slug}-{year}`
 * Example: `atlanta-ga/smith-family-estate-2026`
 */
export function generateSaleSlug({
  title,
  city,
  state,
  startDate,
}: {
  title: string;
  city: string;
  state: string;
  startDate: string;
}): string {
  const titleSlug = slugifySegment(title) || "sale";

  const citySlug = city
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const stateSlug = state.toLowerCase().trim();

  const parsed = new Date(startDate);
  const year = Number.isNaN(parsed.getTime())
    ? new Date().getFullYear()
    : parsed.getFullYear();

  return `${citySlug}-${stateSlug}/${titleSlug}-${year}`;
}

function slugifySegment(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

/** ~0.5 mile offset in degrees (rough; varies slightly by latitude). */
const FUZZ_OFFSET_DEG = 0.007;

/**
 * Offset coordinates by ~0.5 miles for approximate map display before address reveal.
 * Uses random offsets (not deterministic).
 */
export function fuzzCoordinates(
  lat: number,
  lng: number,
): { lat_fuzzy: number; lng_fuzzy: number } {
  const latOffset = (Math.random() - 0.5) * FUZZ_OFFSET_DEG * 2;
  const lngOffset = (Math.random() - 0.5) * FUZZ_OFFSET_DEG * 2;

  return {
    lat_fuzzy: Math.round((lat + latOffset) * 1_000_000) / 1_000_000,
    lng_fuzzy: Math.round((lng + lngOffset) * 1_000_000) / 1_000_000,
  };
}
