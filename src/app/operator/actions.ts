"use server";

import { createClient } from "@/lib/supabase/server";
import { buildRegionSlug, fuzzCoordinates } from "@/utils/sales";
import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

const updateLocationSchema = z.object({
  saleId: z.string().uuid(),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().nullable(),
  addressRevealAt: z.string().min(1),
});

async function getUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

/** Ensure operators row exists for auth.users (required for sales FK). */
async function ensureOperatorRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string | null },
): Promise<ActionResult> {
  const { data: existing } = await supabase
    .from("operators")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return { ok: true };

  const email = user.email ?? "unknown@example.com";
  const slug = `op-${user.id.replace(/-/g, "").slice(0, 12)}`;

  const { error } = await supabase.from("operators").insert({
    id: user.id,
    email,
    name: email.split("@")[0] ?? "Operator",
    slug,
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function createDraftSale(): Promise<ActionResult<{ saleId: string }>> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Sign in to create a sale." };

  const ensured = await ensureOperatorRow(supabase, user);
  if (!ensured.ok) return ensured;

  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().slice(0, 8);
  const listingSlug = `untitled-${suffix}-${year}`;
  const city = "Atlanta";
  const state = "GA";
  const regionSlug = buildRegionSlug(city, state);

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const reveal = new Date();
  reveal.setDate(reveal.getDate() + 1);

  const { data, error } = await supabase
    .from("sales")
    .insert({
      operator_id: user.id,
      title: "New sale",
      description: null,
      city,
      state,
      zip: null,
      region_slug: regionSlug,
      listing_slug: listingSlug,
      address: null,
      lat: null,
      lng: null,
      lat_fuzzy: null,
      lng_fuzzy: null,
      address_reveal_at: reveal.toISOString(),
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      preview_times: null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Could not create draft." };
  }

  revalidatePath("/operator");
  return { ok: true, data: { saleId: data.id } };
}

export type OperatorSaleRow = {
  id: string;
  title: string;
  status: string;
  city: string;
  state: string;
  created_at: string;
};

export async function listOperatorSales(): Promise<
  ActionResult<OperatorSaleRow[]>
> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data, error } = await supabase
    .from("sales")
    .select("id, title, status, city, state, created_at")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, message: error.message };
  return { ok: true, data: data ?? [] };
}

export type SaleLocationRow = {
  id: string;
  title: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string;
  state: string;
  zip: string | null;
  address_reveal_at: string;
  region_slug: string;
  listing_slug: string;
};

export async function getSaleForOperator(
  saleId: string,
): Promise<ActionResult<SaleLocationRow>> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, title, address, lat, lng, city, state, zip, address_reveal_at, region_slug, listing_slug",
    )
    .eq("id", saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: "Sale not found." };
  return { ok: true, data };
}

export async function updateSaleLocation(
  raw: z.infer<typeof updateLocationSchema>,
): Promise<ActionResult> {
  const parsed = updateLocationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const {
    saleId,
    address,
    latitude,
    longitude,
    city,
    state,
    zip,
    addressRevealAt,
  } = parsed.data;

  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { lat_fuzzy, lng_fuzzy } = fuzzCoordinates(latitude, longitude);
  const regionSlug = buildRegionSlug(city, state);

  const { error } = await supabase
    .from("sales")
    .update({
      address,
      lat: latitude,
      lng: longitude,
      lat_fuzzy,
      lng_fuzzy,
      city,
      state,
      zip,
      region_slug: regionSlug,
      address_reveal_at: addressRevealAt,
    })
    .eq("id", saleId)
    .eq("operator_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/operator");
  revalidatePath(`/operator/sales/${saleId}/location`);
  revalidatePath("/sales");
  return { ok: true };
}
