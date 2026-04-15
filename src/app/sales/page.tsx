import type { MapSale } from "@/components/SalesMap";
import ExploreSales from "@/components/ExploreSales";

export default async function SalesIndexPage() {
  const sales: (MapSale & {
    region_slug: string;
    listing_slug: string;
    city: string;
    state: string;
  })[] = [
    {
      id: "demo-atl-1",
      title: "Smith Family Estate",
      lat: 33.749,
      lng: -84.388,
      addressVisible: false,
      main_display_image: "/placeholder.svg",
      sale_dates: [{ sale_date: "2026-05-01" }, { sale_date: "2026-05-03" }],
      region_slug: "atlanta-ga",
      listing_slug: "smith-family-estate-2026",
      city: "Atlanta",
      state: "GA",
      href: "/sales/atlanta-ga/smith-family-estate-2026",
    },
    {
      id: "demo-atl-2",
      title: "Midtown Vintage & Art",
      lat: 33.783,
      lng: -84.383,
      addressVisible: true,
      main_display_image: "/placeholder.svg",
      sale_dates: [{ sale_date: "2026-05-10" }, { sale_date: "2026-05-11" }],
      region_slug: "atlanta-ga",
      listing_slug: "midtown-vintage-art-2026",
      city: "Atlanta",
      state: "GA",
      href: "/sales/atlanta-ga/midtown-vintage-art-2026",
    },
    {
      id: "demo-bkn-1",
      title: "Park Slope Moving Sale",
      lat: 40.672,
      lng: -73.978,
      addressVisible: false,
      main_display_image: "/placeholder.svg",
      sale_dates: [{ sale_date: "2026-06-06" }, { sale_date: "2026-06-07" }],
      region_slug: "brooklyn-ny",
      listing_slug: "park-slope-moving-sale-2026",
      city: "Brooklyn",
      state: "NY",
      href: "/sales/brooklyn-ny/park-slope-moving-sale-2026",
    },
  ];

  return <ExploreSales sales={sales} initialCenter={[33.749, -84.388]} />;
}
