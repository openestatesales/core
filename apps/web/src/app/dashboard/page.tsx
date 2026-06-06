import { OperatorDashboardHub } from "@/components/operator/dashboard/OperatorDashboardHub";
import { syncExpiredSalesForOperator } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await syncExpiredSalesForOperator(supabase, user.id);

  const { data: sales } = await supabase
    .from("sales")
    .select(
      "id, title, status, city, state, created_at, start_date, end_date, region_slug, listing_slug",
    )
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <OperatorDashboardHub
      sales={sales ?? []}
      showOperatorProfileLink
    />
  );
}
