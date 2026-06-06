import { getSaleForOperator, type OperatorSaleWizard } from "@/app/dashboard/actions";
import { isSaleEditable } from "@/lib/sale-status";
import { notFound, redirect } from "next/navigation";

/** Load a draft sale for wizard steps; redirect live/ended sales to overview. */
export async function requireEditableSale(
  saleId: string,
): Promise<OperatorSaleWizard> {
  const result = await getSaleForOperator(saleId);

  if (!result.ok || !result.data) {
    notFound();
  }

  if (!isSaleEditable(result.data.status, result.data.end_date)) {
    redirect(`/dashboard/sales/${saleId}`);
  }

  return result.data;
}
