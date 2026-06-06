import { requireEditableSale } from "@/app/dashboard/sales/require-editable-sale";
import SaleDetailsForm from "@/components/operator/SaleDetailsForm";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSaleDetailsPage({ params }: Props) {
  const { saleId } = await params;
  const sale = await requireEditableSale(saleId);

  return <SaleDetailsForm saleId={saleId} initial={sale} />;
}
