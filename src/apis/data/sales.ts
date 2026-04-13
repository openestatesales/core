import { createClient } from "@/lib/supabase/server";
import { applyAddressReveal, type PublicSale } from "@oes/types";

export async function getSaleBySlug(slug: string): Promise<PublicSale | null> {
  const supabase = await createClient();

  const { data: row, error: saleError } = await supabase
    .from("sales_public_listing")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (saleError || !row) {
    return null;
  }

  const [{ data: photos }, { data: operatorRows }] = await Promise.all([
    supabase
      .from("sale_photos")
      .select("id, storage_path, sort_order, alt_text")
      .eq("sale_id", row.id)
      .order("sort_order", { ascending: true }),
    supabase.rpc("get_public_operator", { operator_id: row.operator_id }),
  ]);

  const operator =
    operatorRows && operatorRows.length > 0 ? operatorRows[0] : null;

  const sale: PublicSale = {
    ...applyAddressReveal(row),
    photos: photos ?? [],
    operator: operator ?? undefined,
  };

  return sale;
}

export async function getSales({
  state,
  city,
  limit = 20,
  offset = 0,
}: {
  state?: string;
  city?: string;
  limit?: number;
  offset?: number;
}): Promise<PublicSale[]> {
  const supabase = await createClient();

  let query = supabase
    .from("sales_public_listing")
    .select("*")
    .gte("end_date", new Date().toISOString().split("T")[0]!)
    .order("start_date", { ascending: true })
    .range(offset, offset + limit - 1);

  if (state) {
    query = query.eq("state", state);
  }
  if (city) {
    query = query.ilike("city", city);
  }

  const { data: rows, error } = await query;

  if (error || !rows?.length) {
    return [];
  }

  const ids = rows.map((r) => r.id);
  const { data: photos } = await supabase
    .from("sale_photos")
    .select("id, sale_id, storage_path, sort_order, alt_text")
    .in("sale_id", ids)
    .order("sort_order", { ascending: true });

  const bySale = new Map<string, PublicSale["photos"]>();
  for (const p of photos ?? []) {
    const sid = p.sale_id as string;
    const list = bySale.get(sid) ?? [];
    list.push({
      id: p.id,
      storage_path: p.storage_path,
      sort_order: p.sort_order,
      alt_text: p.alt_text,
    });
    bySale.set(sid, list);
  }

  return rows.map((row) => ({
    ...applyAddressReveal(row),
    photos: bySale.get(row.id) ?? [],
  }));
}

export async function incrementViewCount(saleId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("increment_view_count", { sale_id: saleId });
}
