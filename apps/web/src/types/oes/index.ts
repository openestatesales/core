/** Public operator fields (no email/phone). */
export type PublicOperator = {
  id: string;
  name: string;
  company_name: string | null;
  slug: string;
  city: string | null;
  state: string | null;
  operator_kind: "individual" | "company";
  company_logo_url: string | null;
};

export type PublicSalePhoto = {
  id: string;
  storage_path: string;
  sort_order: number;
  alt_text: string | null;
};

/**
 * Row shape for discovery / detail (matches `sales_public_listing` + joined photos/operator).
 * Canonical URL: `/sales/{region_slug}/{listing_slug}`
 */
export type PublicSale = {
  id: string;
  operator_id: string;
  title: string;
  region_slug: string;
  listing_slug: string;
  description: string | null;
  city: string;
  state: string;
  zip: string | null;
  lat_fuzzy: number | null;
  lng_fuzzy: number | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  address_reveal_at: string;
  start_date: string;
  end_date: string;
  preview_times: string | null;
  status: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  /** From joined operators row on `sales_public_listing`. */
  operator_kind: "individual" | "company";
  photos?: PublicSalePhoto[];
  operator?: PublicOperator | null;
};

/**
 * Ensures exact address / coords are null until `address_reveal_at` (defensive if data is not from `sales_public_listing`).
 */
export function applyAddressReveal<
  T extends {
    address_reveal_at: string;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
  },
>(
  row: T,
): T & { address: string | null; lat: number | null; lng: number | null } {
  const reveal =
    typeof row.address_reveal_at === "string" &&
    !Number.isNaN(Date.parse(row.address_reveal_at)) &&
    new Date(row.address_reveal_at) <= new Date();

  return {
    ...row,
    address: reveal ? (row.address ?? null) : null,
    lat: reveal ? (row.lat ?? null) : null,
    lng: reveal ? (row.lng ?? null) : null,
  };
}
