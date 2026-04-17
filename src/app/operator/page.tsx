import Link from "next/link";

import { CreateDraftSaleButton } from "@/components/operator/CreateDraftSaleButton";
import { createClient } from "@/lib/supabase/server";

export default async function OperatorHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: sales } = await supabase
    .from("sales")
    .select("id, title, status, city, state, created_at")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl uppercase tracking-tight text-foreground">
        Operator
      </h1>
      <p className="mt-2 text-muted-foreground">
        Drafts and listings tied to your account. More tools soon.
      </p>

      <div className="mt-8">
        <CreateDraftSaleButton />
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your sales
        </h2>
        {sales && sales.length > 0 ? (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {sales.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/operator/sales/${row.id}/location`}
                  className="flex flex-col gap-1 px-4 py-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-foreground">{row.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.status} · {row.city}, {row.state}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No sales yet — create a draft to set location and details next.
          </p>
        )}
      </section>
    </main>
  );
}
