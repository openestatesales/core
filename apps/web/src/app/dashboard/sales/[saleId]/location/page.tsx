import { requireEditableSale } from "@/app/dashboard/sales/require-editable-sale";
import SaleLocationForm from "@/components/operator/SaleLocationForm";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSaleLocationPage({ params }: Props) {
  const { saleId } = await params;
  const sale = await requireEditableSale(saleId);

  return <SaleLocationForm saleId={saleId} initial={sale} />;
}
