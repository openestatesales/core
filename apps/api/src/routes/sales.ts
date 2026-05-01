import { Hono } from "hono";
import { z } from "zod";
import type { ApiEnv } from "../env";
import { verifyApiKey } from "../auth";
import { createSupabaseAdmin } from "../supabase-admin";

const createSaleSchema = z.object({
  title: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().nullable().optional(),
});

function operatorSlugFromId(id: string): string {
  return `op-${id.replace(/-/g, "").slice(0, 12)}`;
}

function buildRegionSlug(city: string, state: string): string {
  const c = city.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const s = state.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `${c}-${s}`;
}

function buildListingSlug(title: string, startDate: string): string {
  const year = startDate.slice(0, 4);
  const t = title
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${t}-${year}`;
}

export function salesRoutes(env: ApiEnv) {
  const app = new Hono();

  app.post("/v1/sales", async (c) => {
    const auth = await verifyApiKey(env, c.req.header("authorization") ?? null);
    if (!auth) return c.json({ error: "unauthorized" }, 401);
    if (!auth.scopes.includes("sales:write")) {
      return c.json({ error: "forbidden", missing_scope: "sales:write" }, 403);
    }

    const parsed = createSaleSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: "invalid_body", details: parsed.error.flatten() }, 400);
    }

    const supabase = createSupabaseAdmin(env);

    // Ensure the developer also exists as an operator (phase 1 shortcut).
    const { data: operator } = await supabase
      .from("operators")
      .select("id")
      .eq("id", auth.developerId)
      .maybeSingle();

    if (!operator) {
      const { data: userData } = await supabase.auth.admin.getUserById(auth.developerId);
      const email = userData.user?.email ?? "unknown@example.com";
      const name = userData.user?.user_metadata?.full_name ?? email.split("@")[0] ?? "Developer";

      const { error: opErr } = await supabase.from("operators").insert({
        id: auth.developerId,
        email,
        name,
        slug: operatorSlugFromId(auth.developerId),
      });
      if (opErr) {
        return c.json({ error: "operator_create_failed", message: opErr.message }, 500);
      }
    }

    const region_slug = buildRegionSlug(parsed.data.city, parsed.data.state);
    const listing_slug_base = buildListingSlug(parsed.data.title, parsed.data.start_date);
    const listing_slug = `${listing_slug_base}-${crypto.randomUUID().slice(0, 6)}`;

    const start = new Date(parsed.data.start_date + "T12:00:00Z");
    const reveal = new Date(start);
    reveal.setDate(reveal.getDate() + 1);

    const { data: created, error } = await supabase
      .from("sales")
      .insert({
        operator_id: auth.developerId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        city: parsed.data.city,
        state: parsed.data.state,
        zip: null,
        region_slug,
        listing_slug,
        address: null,
        lat: null,
        lng: null,
        lat_fuzzy: null,
        lng_fuzzy: null,
        address_reveal_at: reveal.toISOString(),
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        preview_times: null,
        status: "draft",
      })
      .select("id, region_slug, listing_slug, status, created_at")
      .single();

    if (error || !created) {
      return c.json({ error: "sale_create_failed", message: error?.message ?? "unknown" }, 500);
    }

    return c.json({ ok: true, sale: created }, 201);
  });

  return app;
}

