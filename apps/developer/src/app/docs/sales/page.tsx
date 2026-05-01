import Link from "next/link";

export default function FetchAllSalesDocPage() {
  return (
    <div>
      <p className="kicker">
        <Link className="subtleLink" href="/docs">
          ← Docs
        </Link>
      </p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        Fetch all published sales (public)
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        Independent developers can read all published sales and parse metadata
        across regions. This is read-only.
      </p>

      <div className="tile" style={{ cursor: "default", marginTop: 16 }}>
        <h3 className="tileTitle">HTTP</h3>
        <p className="tileBody">
          Endpoint: <code>GET /v1/sales</code>
        </p>
        <p className="tileBody" style={{ marginTop: 8 }}>
          Auth: none (public)
        </p>
        <p className="tileBody" style={{ marginTop: 8 }}>
          Status: <strong>coming next</strong> (this page defines the contract)
        </p>
      </div>

      <div className="tile" style={{ cursor: "default", marginTop: 12 }}>
        <h3 className="tileTitle">Response shape</h3>
        <p className="tileBody" style={{ marginTop: 8 }}>
          Each sale includes region and listing slugs so you can build stable
          URLs and analytics keys.
        </p>
        <pre
          style={{
            margin: "12px 0 0",
            padding: 14,
            borderRadius: 14,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.12)",
            overflowX: "auto",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >{`{
  "ok": true,
  "sales": [
    {
      "id": "uuid",
      "title": "string",
      "city": "string",
      "state": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "region_slug": "atlanta-ga",
      "listing_slug": "smith-family-estate-2026",
      "published_at": "ISO timestamp"
    }
  ]
}`}</pre>
      </div>

      <div className="tile" style={{ cursor: "default", marginTop: 12 }}>
        <h3 className="tileTitle">Node example</h3>
        <pre
          style={{
            margin: "12px 0 0",
            padding: 14,
            borderRadius: 14,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.12)",
            overflowX: "auto",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >{`const res = await fetch("https://api.openestatesales.com/v1/sales");
const json = await res.json();
console.log(json.sales.length);`}</pre>
      </div>
    </div>
  );
}

