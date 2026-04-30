import { OperatorProfileForm } from "@/components/operator/OperatorProfileForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Operator details and how you appear on listings.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      <OperatorProfileForm initial={initial} email={user.email} />
    </main>
  );
}
