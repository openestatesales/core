export default function SupportPage() {
  return (
    <div>
      <p className="kicker">Support</p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        Get help
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        The fastest way to get unblocked is to open an issue with your use case
        and example payloads.
      </p>

      <div className="tiles" style={{ marginTop: 16 }}>
        <a
          className="tile"
          href="https://github.com/openestatesales/core/issues"
        >
          <h3 className="tileTitle">
            <span>GitHub Issues</span>
            <span style={{ opacity: 0.75 }}>→</span>
          </h3>
          <p className="tileBody">
            Feature requests, bugs, and integration questions.
          </p>
        </a>
      </div>
    </div>
  );
}

