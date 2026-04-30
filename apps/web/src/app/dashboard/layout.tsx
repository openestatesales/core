import { QueryProvider } from "@/providers/QueryProvider";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // Ensure an operators row exists (required for sales FK + dashboard tools).
  const { data: existing } = await supabase
    .from("operators")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const email = user.email ?? "unknown@example.com";
    const slug = `op-${user.id.replace(/-/g, "").slice(0, 12)}`;
    await supabase.from("operators").insert({
      id: user.id,
      email,
      name: email.split("@")[0] ?? "Operator",
      slug,
    });
  }

  return (
    <QueryProvider>
      <div className="flex flex-1 flex-col">{children}</div>
    </QueryProvider>
  );
}
