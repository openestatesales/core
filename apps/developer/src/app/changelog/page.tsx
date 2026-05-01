import Link from "next/link";

export default function ChangelogPage() {
  return (
    <div>
      <p className="kicker">Changelog</p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        Shipping in public
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        Early days. This page will track API versions, breaking changes, and new
        surfaces as they land.
      </p>

      <div className="tile" style={{ cursor: "default", marginTop: 16 }}>
        <h3 className="tileTitle">2026-05-01</h3>
        <p className="tileBody">
          - Developer portal docs scaffolded
          <br />
          - API service prototype created
          <br />- SDK client extended for authenticated requests
        </p>
        <p className="tileBody" style={{ marginTop: 10 }}>
          Next up: <Link className="subtleLink" href="/docs/post-sale">operator OAuth write flow</Link>{" "}
          and <Link className="subtleLink" href="/docs/sales">public list-sales endpoint</Link>.
        </p>
      </div>
    </div>
  );
}

