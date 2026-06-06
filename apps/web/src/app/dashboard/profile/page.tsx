import { OperatorProfileForm } from "@/components/operator/OperatorProfileForm";
import { DashboardPageShell } from "@/components/operator/dashboard/DashboardPageShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OperatorProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?next=/dashboard/profile");
  }

  const { data: row } = await supabase
    .from("operators")
    .select(
      "name, phone, city, state, company_name, operator_kind, company_logo_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  const initial = {
    name: row?.name ?? user.email.split("@")[0] ?? "Operator",
    phone: row?.phone ?? null,
    city: row?.city ?? null,
    state: row?.state ?? null,
    company_name: row?.company_name ?? null,
    operator_kind: (row?.operator_kind === "company" ? "company" : "individual") as
      | "individual"
      | "company",
    company_logo_url: row?.company_logo_url ?? null,
  };

  return (
    <DashboardPageShell
      title="Profile"
      description="Manage your account information and how your business appears on listings."
      backHref="/dashboard"
    >
      <OperatorProfileForm initial={initial} email={user.email} />
    </DashboardPageShell>
  );
}
