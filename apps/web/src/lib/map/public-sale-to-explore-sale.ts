import type { ExploreSale } from "@/components/explore-sales/SaleCard";
import { salePhotoPublicUrl } from "@/config/sale-photos";
import { salePublicPath } from "@/utils/sales";
import type { PublicSale } from "@oes/types";

/**
 * Map a published sale (+ photos) into the explore / map list shape.
 */
export function publicSaleToExploreSale(sale: PublicSale): ExploreSale {
  const photos = [...(sale.photos ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const first = photos[0];
  const main_display_image = first
    ? salePhotoPublicUrl(first.storage_path)
    : null;

  const lat = sale.lat ?? sale.lat_fuzzy ?? undefined;
  const lng = sale.lng ?? sale.lng_fuzzy ?? undefined;

  const start = sale.start_date;
  const end = sale.end_date;
  const sale_dates =
    start === end
      ? [{ sale_date: start }]
      : [{ sale_date: start }, { sale_date: end }];

  const addressVisible = sale.lat != null && sale.lng != null;

  return {
    id: sale.id,
    title: sale.title,
    lat: lat ?? null,
    lng: lng ?? null,
    addressVisible,
    main_display_image,
    sale_dates,
    region_slug: sale.region_slug,
    listing_slug: sale.listing_slug,
    city: sale.city,
    state: sale.state,
    href: salePublicPath(sale.region_slug, sale.listing_slug),
    operator_kind: sale.operator_kind,
  };
}

/** Prefer a real listing pin for the initial map; fall back to default in the page. */
export function initialMapCenterFromExploreSales(
  sales: ExploreSale[],
): [number, number] | null {
  for (const s of sales) {
    const lat = s.lat ?? undefined;
    const lng = s.lng ?? undefined;
    if (typeof lat === "number" && typeof lng === "number") {
      return [lat, lng];
    }
  }
  return null;
}
