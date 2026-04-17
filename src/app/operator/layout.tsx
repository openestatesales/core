import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/operator");
  }

  return <div className="flex flex-1 flex-col">{children}</div>;
}
