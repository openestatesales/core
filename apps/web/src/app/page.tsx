import type { Metadata } from "next";

import { getSales } from "@/apis/data/sales";
import ExploreSales from "@/components/ExploreSales";
import { HomeWaitlistStrip } from "@/components/HomeWaitlistStrip";
import { DEFAULT_MAP_CENTER } from "@/data/map-defaults";
import {
  initialMapCenterFromExploreSales,
  publicSaleToExploreSale,
} from "@/lib/map/public-sale-to-explore-sale";

export const metadata: Metadata = {
  title: "Browse estate sales near you",
  description:
    "Search local estate sales on the map or list — free for shoppers and operators.",
};

export default async function Home() {
  const rows = await getSales({ limit: 200 });
  const explore = rows.map(publicSaleToExploreSale);
  const initialCenter =
    initialMapCenterFromExploreSales(explore) ?? DEFAULT_MAP_CENTER;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ExploreSales sales={explore} initialCenter={initialCenter} />
      <HomeWaitlistStrip />
    </div>
  );
}
