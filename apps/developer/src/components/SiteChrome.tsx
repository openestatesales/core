import Link from "next/link";

export function SiteChrome({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "docs" | "sdks" | "support";
}) {
  return (
    <>
      <header className="header">
        <div className="container">
          <div className="headerRow">
            <Link className="brand" href="/">
              <span className="brandMark" aria-hidden="true" />
              <span>Open Estate Sales Developer</span>
            </Link>

            <nav className="nav" aria-label="Primary">
              <Link
                href="/docs"
                style={{ opacity: active === "docs" ? 1 : undefined }}
              >
                Docs
              </Link>
              <Link
                href="/sdks"
                style={{ opacity: active === "sdks" ? 1 : undefined }}
              >
                SDKs & APIs
              </Link>
              <Link
                href="/support"
                style={{ opacity: active === "support" ? 1 : undefined }}
              >
                Support
              </Link>
            </nav>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link className="btn" href="/login">
                Sign in
              </Link>
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

