"use server";

import { createClient } from "@/lib/supabase/server";
import { buildRegionSlug } from "@/utils/sales";
import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

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
      title: "Untitled sale",
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

  revalidatePath("/dashboard");
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

/** Operator-facing sale row for the create-sale wizard and location form. */
export type OperatorSaleWizard = {
  id: string;
  operator_id: string;
  title: string;
  description: string | null;
  sale_kind: string;
  phone_display: string;
  contact_phone_custom: string | null;
  directions_parking: string | null;
  terms_html: string | null;
  sale_dates_json: unknown | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string;
  state: string;
  zip: string | null;
  address_reveal_at: string;
  region_slug: string;
  listing_slug: string;
  start_date: string;
  end_date: string;
  preview_times: string | null;
  status: string;
};

/** @deprecated Use OperatorSaleWizard */
export type SaleLocationRow = OperatorSaleWizard;

export async function getSaleForOperator(
  saleId: string,
): Promise<ActionResult<OperatorSaleWizard>> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, operator_id, title, description, sale_kind, phone_display, contact_phone_custom, directions_parking, terms_html, sale_dates_json, address, lat, lng, city, state, zip, address_reveal_at, region_slug, listing_slug, start_date, end_date, preview_times, status",
    )
    .eq("id", saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: "Sale not found." };
  return { ok: true, data };
}

export async function deleteSale(saleId: string): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", saleId)
    .eq("operator_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

