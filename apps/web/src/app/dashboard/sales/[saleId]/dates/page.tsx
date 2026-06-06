import { requireEditableSale } from "@/app/dashboard/sales/require-editable-sale";
import SaleDatesForm from "@/components/operator/SaleDatesForm";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSaleDatesPage({ params }: Props) {
  const { saleId } = await params;
  const sale = await requireEditableSale(saleId);

  return <SaleDatesForm saleId={saleId} initial={sale} />;
}
