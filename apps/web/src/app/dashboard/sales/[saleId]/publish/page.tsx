import { requireEditableSale } from "@/app/dashboard/sales/require-editable-sale";
import SalePublishForm from "@/components/operator/SalePublishForm";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSalePublishPage({ params }: Props) {
  const { saleId } = await params;
  const sale = await requireEditableSale(saleId);

  return <SalePublishForm saleId={saleId} initial={sale} />;
}
