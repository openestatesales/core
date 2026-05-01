import Link from "next/link";

export default function PostSaleDocPage() {
  return (
    <div>
      <p className="kicker">
        <Link className="subtleLink" href="/docs">
          ← Docs
        </Link>
      </p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        Post a sale (operator OAuth)
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        Creating or updating a sale is operator-only. Independent developers
        cannot post sales with API keys.
      </p>

      <div className="tile" style={{ cursor: "default", marginTop: 16 }}>
        <h3 className="tileTitle">HTTP</h3>
        <p className="tileBody">
          Endpoint: <code>POST /v1/operator/sales</code>
        </p>
        <p className="tileBody" style={{ marginTop: 8 }}>
          Auth: <code>Authorization: Bearer &lt;oauth_access_token&gt;</code>
        </p>
        <p className="tileBody" style={{ marginTop: 8 }}>
          Status: <strong>coming next</strong> (this page defines the contract)
        </p>
      </div>

      <div className="tile" style={{ cursor: "default", marginTop: 12 }}>
        <h3 className="tileTitle">Request body</h3>
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
  "title": "My Sale",
  "city": "Atlanta",
  "state": "GA",
  "start_date": "2026-05-10",
  "end_date": "2026-05-12"
}`}</pre>
      </div>
    </div>
  );
}

