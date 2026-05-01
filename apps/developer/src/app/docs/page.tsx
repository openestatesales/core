import Link from "next/link";

export default function DocsHomePage() {
  return (
    <div>
      <p className="kicker">Docs</p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        Start here
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        Independent developers can read all published sales and metadata. Posting
        sales is operator-only and requires OAuth.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <details
          open
          className="tile"
          style={{ cursor: "default" }}
        >
          <summary
            className="tileTitle"
            style={{ cursor: "pointer", listStyle: "none" }}
          >
            <span>API Reference (OpenAPI)</span>
            <span style={{ opacity: 0.75 }}>↓</span>
          </summary>
          <p className="tileBody" style={{ marginTop: 10 }}>
            Searchable reference UI powered by Redoc.
          </p>
          <div className="ctaRow" style={{ marginTop: 12 }}>
            <Link className="btn btnPrimary" href="/docs/api-reference">
              Open API Reference →
            </Link>
            <a className="btn" href="/openapi.yaml">
              Download openapi.yaml →
            </a>
          </div>
        </details>

        <details className="tile" style={{ cursor: "default" }}>
          <summary
            className="tileTitle"
            style={{ cursor: "pointer", listStyle: "none" }}
          >
            <span>Public reads (independent developers)</span>
            <span style={{ opacity: 0.75 }}>↓</span>
          </summary>
          <p className="tileBody" style={{ marginTop: 10 }}>
            Fetch all published sales and parse metadata across regions. No auth.
          </p>
          <div className="ctaRow" style={{ marginTop: 12 }}>
            <Link className="btn btnPrimary" href="/docs/sales">
              Fetch all sales →
            </Link>
          </div>
        </details>

        <details className="tile" style={{ cursor: "default" }}>
          <summary
            className="tileTitle"
            style={{ cursor: "pointer", listStyle: "none" }}
          >
            <span>Write access (operators only)</span>
            <span style={{ opacity: 0.75 }}>↓</span>
          </summary>
          <p className="tileBody" style={{ marginTop: 10 }}>
            Creating/updating/publishing sales requires operator OAuth. Independent
            developer API keys cannot post sales.
          </p>
          <div className="ctaRow" style={{ marginTop: 12 }}>
            <Link className="btn btnPrimary" href="/docs/operator-oauth">
              Operator OAuth →
            </Link>
            <Link className="btn" href="/docs/post-sale">
              Post a sale (contract) →
            </Link>
          </div>
        </details>
      </div>
    </div>
  );
}

