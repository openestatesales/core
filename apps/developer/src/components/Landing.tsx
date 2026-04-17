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
  sdkBaseUrl,
  children,
}: {
  sdkBaseUrl: string;
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
              <a href="#docs">Docs</a>
              <a href="#sdks">SDKs & APIs</a>
              <a href="#community">Support</a>
              <a href="#changelog">Changelog</a>
            </nav>

            <a className="btn" href="#docs">
              View docs <ArrowRight />
            </a>
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
                  Build with <span className="accent">open</span> listings,{" "}
                  seller tools, and local discovery.
                </h1>
                <p className="lede">
                  We’re building an open platform for estate sales: listings,
                  regions, locations, and the tools to help communities share
                  and find sales without lock-in.
                </p>

                <div className="ctaRow" id="docs">
                  <a className="btn btnPrimary" href="#sdks">
                    Start building <ArrowRight />
                  </a>
                  <a className="btn" href="#changelog">
                    View updates <ArrowRight />
                  </a>
                </div>
              </div>

              <aside className="heroCard" id="sdks">
                <h2 className="heroCardTitle">Quick start</h2>
                <p className="heroCardBody">
                  SDK base URL: <code>{sdkBaseUrl}</code>
                </p>
                <p className="heroCardBody" style={{ marginTop: 8 }}>
                  Today this portal is a landing page; next up: docs, an API
                  reference, and real examples powered by <code>@oes/sdk</code>.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="kicker">Explore</p>
            <h2 className="h2">Pick a surface area to build on</h2>

            <div className="tiles">
              <Tile
                title="Discover listings"
                body="Search by region, map, and filters to help buyers find sales."
                href="#"
              />
              <Tile
                title="Operator tools"
                body="Create, manage, and publish sales with location-aware workflows."
                href="#"
              />
              <Tile
                title="Content + guides"
                body="Docs, examples, and recipes for integrating with OES."
                href="#"
              />
              <Tile
                title="Webhooks (soon)"
                body="Event-driven updates for sales changes and publishing."
                href="#"
              />
              <Tile
                title="SDKs (WIP)"
                body="Typed client helpers and shared primitives in packages/sdk."
                href="#"
              />
              <Tile
                title="Status + changelog"
                body="What shipped, what’s next, and how to track platform changes."
                href="#changelog"
              />
            </div>

            {children ? (
              <div style={{ marginTop: 26 }}>{children}</div>
            ) : null}
          </div>
        </section>

        <section className="section" id="community">
          <div className="container">
            <p className="kicker">Community</p>
            <h2 className="h2">Help us shape the platform</h2>
            <p className="lede" style={{ marginTop: 10 }}>
              This developer portal is early. If you’re building something,
              tell us what endpoints, docs, and examples would unblock you.
            </p>
            <div className="ctaRow" style={{ marginTop: 14 }}>
              <a className="btn" href="https://github.com">
                Open an issue <ArrowRight />
              </a>
              <a className="btn" href="https://openestatesales.com">
                See the app <ArrowRight />
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="changelog">
          <div className="container">
            <p className="kicker">Changelog</p>
            <h2 className="h2">Shipping in public</h2>
            <div className="tiles" style={{ marginTop: 14 }}>
              <Tile
                title="Monorepo + developer app"
                body="TurboRepo setup with apps/web and apps/developer."
                href="#"
              />
              <Tile
                title="SDK + UI packages (WIP)"
                body="Shared packages scaffolded for iterative growth."
                href="#"
              />
              <Tile
                title="Next: real API surface"
                body="Define endpoints, auth, and versioning strategy."
                href="#"
              />
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

