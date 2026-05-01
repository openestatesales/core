import "dotenv/config";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getEnv } from "./env";
import { salesRoutes } from "./routes/sales";

const env = getEnv();

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/", salesRoutes(env));

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${info.port}`);
  },
);

