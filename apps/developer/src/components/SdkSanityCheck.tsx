"use client";

import { Button } from "@oes/ui";

export function SdkSanityCheck({ baseUrl }: { baseUrl: string }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>SDK sanity check</h2>
      <p style={{ margin: "0 0 10px", opacity: 0.9 }}>
        Client base URL: <code>{baseUrl}</code>
      </p>
      <Button type="button" onClick={() => alert("Hello from @oes/ui")}>
        UI button
      </Button>
    </section>
  );
}

