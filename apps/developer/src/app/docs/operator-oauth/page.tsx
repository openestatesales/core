import Link from "next/link";

export default function OperatorOauthDocPage() {
  return (
    <div>
      <p className="kicker">
        <Link className="subtleLink" href="/docs">
          ← Docs
        </Link>
      </p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        Operator OAuth
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        Operator OAuth is the only way to get write access (create/update/publish
        sales). API keys are for developer accounts and are read-only.
      </p>

      <div className="tile" style={{ cursor: "default", marginTop: 16 }}>
        <h3 className="tileTitle">What OAuth grants</h3>
        <p className="tileBody">
          - Read your operator profile and your own sales
          <br />
          - Create and update your own sales
          <br />- Publish when required fields are complete
        </p>
      </div>

      <div className="tile" style={{ cursor: "default", marginTop: 12 }}>
        <h3 className="tileTitle">Status</h3>
        <p className="tileBody">
          OAuth flows and endpoints are being built next. This doc is the
          north-star for the first operator integrations.
        </p>
      </div>
    </div>
  );
}

