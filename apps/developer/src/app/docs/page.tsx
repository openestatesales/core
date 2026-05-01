import Link from "next/link";

function DocLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link className="tile" href={href}>
      <h3 className="tileTitle">
        <span>{title}</span>
        <span style={{ opacity: 0.75 }}>→</span>
      </h3>
      <p className="tileBody">{body}</p>
    </Link>
  );
}

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

      <div className="tiles" style={{ marginTop: 16 }}>
        <DocLink
          href="/docs/sales"
          title="Fetch all sales (public)"
          body="List published sales across regions and parse metadata for discovery and analytics."
        />
        <DocLink
          href="/docs/post-sale"
          title="Post a sale (operator OAuth)"
          body="Create a sale programmatically for the signed-in operator (write access)."
        />
        <DocLink
          href="/docs/operator-oauth"
          title="Operator OAuth"
          body="How operator authentication and authorization works for write endpoints."
        />
      </div>
    </div>
  );
}

