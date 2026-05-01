import Link from "next/link";

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 5l7 7-7 7M20 12H4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tile({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link className="tile" href={href}>
      <h3 className="tileTitle">
        <span>{title}</span>
        <span style={{ opacity: 0.75 }}>
          <ArrowRight />
        </span>
      </h3>
      <p className="tileBody">{body}</p>
    </Link>
  );
}

export function Landing({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbarRow">
            <span className="badge">
              <span className="badgeDot" />
              Now building: developer.openestatesales.com
            </span>
            <a
              href="https://openestatesales.com"
              style={{ textDecoration: "none", color: "rgba(255,255,255,0.86)" }}
            >
              Visit the main site <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container">
          <div className="headerRow">
            <Link className="brand" href="/">
              <span className="brandMark" aria-hidden="true" />
              <span>Open Estate Sales Developer</span>
            </Link>

            <nav className="nav" aria-label="Primary">
              <Link href="/docs">Docs</Link>
              <Link href="/sdks">SDKs & APIs</Link>
              <Link href="/support">Support</Link>
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
        <section className="hero">
          <div className="container">
            <div className="heroGrid">
              <div>
                <p className="kicker">APIs & SDKs</p>
                <h1 className="h1">
                  Build with <span className="accent">open</span> listings and{" "}
                  operator-first tools.
                </h1>
                <p className="lede">
                  Two lanes to start: OAuth for operators to manage their own
                  sales, and public discovery APIs for independent developers to
                  parse listings and metadata across regions.
                </p>

                <div className="ctaRow" id="docs">
                  <Link className="btn btnPrimary" href="/docs">
                    Start building <ArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="kicker">Explore</p>
            <h2 className="h2">Start with these first use cases</h2>

            <div className="tiles">
              <Tile
                title="Operator OAuth (read + write your sales)"
                body="Operators authenticate with OAuth to create, update, publish, and manage only their own sales."
                href="/docs/operator-oauth"
              />
              <Tile
                title="Independent developer (read all public sales)"
                body="Parse all published sales and metadata across regions for analytics, search, and discovery."
                href="/docs/sales"
              />
              <Tile
                title="Metadata + normalization"
                body="Work with regions, listing slugs, sale dates, and derived fields to build reliable pipelines."
                href="/docs/sales"
              />
              <Tile
                title="Webhooks (soon)"
                body="Event-driven updates when a sale is created, updated, or published."
                href="/docs"
              />
              <Tile
                title="SDKs (WIP)"
                body="Typed client helpers and shared primitives in packages/sdk."
                href="/sdks"
              />
              <Tile
                title="Status + changelog"
                body="What shipped, what’s next, and how to track platform changes."
                href="/docs"
              />
            </div>

            {children ? (
              <div style={{ marginTop: 26 }}>{children}</div>
            ) : null}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="kicker">Community</p>
            <h2 className="h2">Help us shape the platform</h2>
            <p className="lede" style={{ marginTop: 10 }}>
              This developer portal is early. If you’re building something,
              tell us what endpoints, docs, and examples would unblock you.
            </p>
            <div className="ctaRow" style={{ marginTop: 14 }}>
              <a
                className="btn"
                href="https://github.com/openestatesales/core/issues"
              >
                Open an issue <ArrowRight />
              </a>
              <a className="btn" href="https://openestatesales.com">
                See the app <ArrowRight />
              </a>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Open Estate Sales. Built for communities.
        </div>
      </footer>
    </>
  );
}

