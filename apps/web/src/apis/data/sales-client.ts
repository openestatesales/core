/**
 * Browser Supabase mutations for operator sale flows (RLS: authenticated user).
 * Public server reads stay in `sales.ts` (server-only).
 */

import type { SaleKindValue } from "@/lib/sale-kinds";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { plainTextFromHtml } from "@/utils/html";
import {
  buildListingSlug,
  buildRegionSlug,
  fuzzCoordinates,
  salePublicPath,
} from "@/utils/sales";
import type { SaleDateRow } from "@/form-schemas/sale";

export type MutationResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

async function ensureOperatorRow(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  user: { id: string; email?: string | null },
): Promise<MutationResult> {
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

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function createSale(): Promise<
  MutationResult<{ saleId: string }>
> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, message: "Missing Supabase client configuration." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "Sign in to create a sale." };
  }

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

  return { ok: true, data: { saleId: data.id } };
}

/** Wizard step 1: name, kind, phone, directions, address & reveal. */
export type UpdateSaleBasicsInput = {
  saleId: string;
  title: string;
  saleKind: SaleKindValue;
  phoneDisplay: "show_account" | "hidden" | "custom";
  contactPhoneCustom: string | null;
  directionsParking: string | null;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip: string | null;
  addressRevealAt: string;
};

export async function updateSaleBasics(
  input: UpdateSaleBasicsInput,
): Promise<MutationResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, message: "Missing Supabase client configuration." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "Not signed in." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, message: "Enter a sale name." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("sales")
    .select("start_date, city, state")
    .eq("id", input.saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (fetchError) return { ok: false, message: fetchError.message };
  if (!row) return { ok: false, message: "Sale not found." };

  const listingSlug = buildListingSlug(title, row.start_date);
  const regionSlug = buildRegionSlug(row.city, row.state);

  const { lat_fuzzy, lng_fuzzy } = fuzzCoordinates(input.latitude, input.longitude);

  const { error } = await supabase
    .from("sales")
    .update({
      title,
      sale_kind: input.saleKind,
      phone_display: input.phoneDisplay,
      contact_phone_custom:
        input.phoneDisplay === "custom"
          ? input.contactPhoneCustom?.trim() || null
          : null,
      directions_parking: input.directionsParking?.trim() || null,
      address: input.address,
      lat: input.latitude,
      lng: input.longitude,
      lat_fuzzy,
      lng_fuzzy,
      city: input.city,
      state: input.state,
      zip: input.zip,
      region_slug: regionSlug,
      listing_slug: listingSlug,
      address_reveal_at: input.addressRevealAt,
    })
    .eq("id", input.saleId)
    .eq("operator_id", user.id);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Wizard step 2: terms + listing description (HTML). */
export type UpdateSaleListingCopyInput = {
  saleId: string;
  termsHtml: string | null;
  descriptionHtml: string | null;
};

export async function updateSaleListingCopy(
  input: UpdateSaleListingCopyInput,
): Promise<MutationResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, message: "Missing Supabase client configuration." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "Not signed in." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("sales")
    .select("title, start_date, city, state")
    .eq("id", input.saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (fetchError) return { ok: false, message: fetchError.message };
  if (!row) return { ok: false, message: "Sale not found." };

  const listingSlug = buildListingSlug(row.title, row.start_date);
  const regionSlug = buildRegionSlug(row.city, row.state);

  const { error } = await supabase
    .from("sales")
    .update({
      terms_html: input.termsHtml?.trim() || null,
      description: input.descriptionHtml?.trim() || null,
      listing_slug: listingSlug,
      region_slug: regionSlug,
    })
    .eq("id", input.saleId)
    .eq("operator_id", user.id);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export type UpdateSaleScheduleInput = {
  saleId: string;
  saleDates: SaleDateRow[];
  previewNotes: string | null;
};

export async function updateSaleSchedule(
  input: UpdateSaleScheduleInput,
): Promise<MutationResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, message: "Missing Supabase client configuration." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "Not signed in." };
  }

  if (!input.saleDates.length) {
    return { ok: false, message: "Add at least one sale day." };
  }

  const days = [...input.saleDates].sort((a, b) => a.date.localeCompare(b.date));
  const startDate = days[0]!.date;
  const endDate = days[days.length - 1]!.date;

  const { data: row, error: fetchError } = await supabase
    .from("sales")
    .select("title, city, state")
    .eq("id", input.saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (fetchError) return { ok: false, message: fetchError.message };
  if (!row) return { ok: false, message: "Sale not found." };

  const listingSlug = buildListingSlug(row.title, startDate);
  const regionSlug = buildRegionSlug(row.city, row.state);

  const { error } = await supabase
    .from("sales")
    .update({
      start_date: startDate,
      end_date: endDate,
      sale_dates_json: days,
      preview_times: input.previewNotes?.trim() || null,
      listing_slug: listingSlug,
      region_slug: regionSlug,
    })
    .eq("id", input.saleId)
    .eq("operator_id", user.id);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function publishSale(saleId: string): Promise<
  MutationResult<{ regionSlug: string; listingSlug: string }>
> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, message: "Missing Supabase client configuration." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "Not signed in." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("sales")
    .select(
      "address, lat, lng, title, region_slug, listing_slug, description, terms_html, sale_dates_json",
    )
    .eq("id", saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (fetchError) return { ok: false, message: fetchError.message };
  if (!row) return { ok: false, message: "Sale not found." };

  if (!row.address || row.lat == null || row.lng == null) {
    return {
      ok: false,
      message: "Add a full address before publishing.",
    };
  }

  const t = row.title.trim();
  if (!t || t === "Untitled sale") {
    return { ok: false, message: "Set a descriptive sale name before publishing." };
  }

  const descPlain = plainTextFromHtml(row.description as string | null);
  if (descPlain.length < 20) {
    return {
      ok: false,
      message: "Add a full description (step 2) before publishing.",
    };
  }

  const termsPlain = plainTextFromHtml(row.terms_html as string | null);
  if (termsPlain.length < 10) {
    return {
      ok: false,
      message: "Add terms & conditions before publishing.",
    };
  }

  const schedule = row.sale_dates_json;
  if (
    !Array.isArray(schedule) ||
    schedule.length < 1 ||
    schedule.length > 4
  ) {
    return {
      ok: false,
      message: "Set your sale days (step 3) before publishing.",
    };
  }

  const publishedAt = new Date().toISOString();

  const { error } = await supabase
    .from("sales")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("id", saleId)
    .eq("operator_id", user.id);

  if (error) return { ok: false, message: error.message };

  return {
    ok: true,
    data: { regionSlug: row.region_slug, listingSlug: row.listing_slug },
  };
}

export function publishedSaleHref(regionSlug: string, listingSlug: string): string {
  return salePublicPath(regionSlug, listingSlug);
}
