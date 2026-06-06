import { requireEditableSale } from "@/app/dashboard/sales/require-editable-sale";
import {
  getSalePhotosState,
  type SalePhotosState,
} from "@/app/dashboard/sale-photos-actions";
import SalePicturesStep from "@/components/operator/SalePicturesStep";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSalePicturesPage({ params }: Props) {
  const { saleId } = await params;
  const sale = await requireEditableSale(saleId);

  const photos = await getSalePhotosState(saleId);
  const emptyPhotosState: SalePhotosState = {
    photos: [],
    publicUrls: [],
    tier: "free",
  };
  const photosState: SalePhotosState =
    photos.ok && photos.data !== undefined ? photos.data : emptyPhotosState;

  return (
    <SalePicturesStep
      saleId={saleId}
      initial={sale}
      photosState={photosState}
    />
  );
}
