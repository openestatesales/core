import { getSaleForOperator } from "@/app/dashboard/actions";
import { SaleOverviewPanel } from "@/components/operator/SaleOverviewPanel";
import { isSaleEditable } from "@/lib/sale-status";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ saleId: string }> };

export default async function OperatorSaleOverviewPage({ params }: Props) {
  const { saleId } = await params;
  const result = await getSaleForOperator(saleId);

  if (!result.ok || !result.data) {
    notFound();
  }

  if (isSaleEditable(result.data.status, result.data.end_date)) {
    redirect(`/dashboard/sales/${saleId}/location`);
  }

  return <SaleOverviewPanel sale={result.data} />;
}
