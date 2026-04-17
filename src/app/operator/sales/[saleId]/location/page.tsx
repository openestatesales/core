import { getSaleForOperator } from "@/app/operator/actions";
import SaleLocationForm from "@/components/operator/SaleLocationForm";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSaleLocationPage({ params }: Props) {
  const { saleId } = await params;
  const result = await getSaleForOperator(saleId);

  if (!result.ok || !result.data) {
    notFound();
  }

  return <SaleLocationForm saleId={saleId} initial={result.data} />;
}
