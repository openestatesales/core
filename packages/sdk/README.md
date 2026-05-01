# @oes/sdk

Typed client utilities for Open Estate Sales APIs.

## Node usage (API key)

```ts
import { createOesClient } from "@oes/sdk";

const client = createOesClient({
  baseUrl: process.env.OES_BASE_URL ?? "http://localhost:3002",
  apiKey: process.env.OES_API_KEY!,
});

await client.sales.create({
  title: "Programmatic Sale",
  city: "Atlanta",
  state: "GA",
  start_date: "2026-05-10",
  end_date: "2026-05-12",
});
```

