import Link from "next/link";

export default function SdksPage() {
  return (
    <div>
      <p className="kicker">SDKs & APIs</p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        SDKs, endpoints, and examples
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        This is the hub for client SDKs and the evolving API surface.
      </p>

      <div className="tiles" style={{ marginTop: 16 }}>
        <Link className="tile" href="/docs/sales">
          <h3 className="tileTitle">
            <span>REST: Fetch all sales</span>
            <span style={{ opacity: 0.75 }}>→</span>
          </h3>
          <p className="tileBody">
            Public, read-only access to published sales and metadata.
          </p>
        </Link>

        <Link className="tile" href="/docs/post-sale">
          <h3 className="tileTitle">
            <span>REST: Post a sale (operator OAuth)</span>
            <span style={{ opacity: 0.75 }}>→</span>
          </h3>
          <p className="tileBody">
            Write endpoints require operator OAuth (not API keys).
          </p>
        </Link>

        <a className="tile" href="https://github.com/openestatesales/core">
          <h3 className="tileTitle">
            <span>@oes/sdk (monorepo)</span>
            <span style={{ opacity: 0.75 }}>→</span>
          </h3>
          <p className="tileBody">
            Typed client helpers live in <code>packages/sdk</code>.
          </p>
        </a>
      </div>
    </div>
  );
}

