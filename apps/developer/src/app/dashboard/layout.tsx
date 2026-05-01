import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
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
    redirect("/login");
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="headerRow">
            <Link className="brand" href="/">
              <span className="brandMark" aria-hidden="true" />
              <span>Open Estate Sales Developer</span>
            </Link>

            <nav className="nav" aria-label="Dashboard">
              <Link href="/dashboard/keys">API Keys</Link>
            </nav>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="section">
          <div className="container">{children}</div>
        </section>
      </main>
    </>
  );
}

