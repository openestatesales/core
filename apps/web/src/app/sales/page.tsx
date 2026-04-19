import { getSales } from "@/apis/data/sales";
import ExploreSales from "@/components/ExploreSales";
import { DEFAULT_MAP_CENTER } from "@/data/map-defaults";
import {
  initialMapCenterFromExploreSales,
  publicSaleToExploreSale,
} from "@/lib/map/public-sale-to-explore-sale";

export default async function SalesIndexPage() {
  const rows = await getSales({ limit: 200 });
  const explore = rows.map(publicSaleToExploreSale);
  const initialCenter =
    initialMapCenterFromExploreSales(explore) ?? DEFAULT_MAP_CENTER;

  return (
    <ExploreSales sales={explore} initialCenter={initialCenter} />
  );
}
