import { createOesClient } from "@oes/sdk";

const baseUrl = process.env.OES_BASE_URL ?? "http://localhost:3002";
const apiKey = process.env.OES_API_KEY;

if (!apiKey) {
  throw new Error("Missing OES_API_KEY");
}

const client = createOesClient({ baseUrl, apiKey });

const res = await client.sales.create({
  title: "Programmatic Sale",
  city: "Atlanta",
  state: "GA",
  start_date: "2026-05-10",
  end_date: "2026-05-12",
});

console.log(JSON.stringify(res, null, 2));

