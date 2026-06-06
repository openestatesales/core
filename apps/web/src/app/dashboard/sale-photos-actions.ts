"use server";

import type { ActionResult } from "@/app/dashboard/actions";
import {
  SALE_PHOTOS_BUCKET,
  maxPhotosForOperatorTier,
  salePhotoPublicUrl,
} from "@/config/sale-photos";
import { isPastEndDate, isSaleEditable } from "@/lib/sale-status";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SalePhotoRow = {
  id: string;
  storage_path: string;
  sort_order: number;
  alt_text: string | null;
};

export type SalePhotosState = {
  photos: SalePhotoRow[];
  publicUrls: string[];
  tier: string;
};

function expectedKeyPrefix(operatorId: string, saleId: string): string {
  return `sales/${operatorId}/${saleId}/`;
}

async function assertSalePhotosEditable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  saleId: string,
  userId: string,
): Promise<ActionResult> {
  const { data: sale, error } = await supabase
    .from("sales")
    .select("status, end_date")
    .eq("id", saleId)
    .eq("operator_id", userId)
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!sale) return { ok: false, message: "Sale not found." };

  if (sale.status === "published" && isPastEndDate(sale.end_date)) {
    await supabase
      .from("sales")
      .update({ status: "ended" })
      .eq("id", saleId)
      .eq("operator_id", userId);
    return {
      ok: false,
      message: "This sale has ended and can no longer be edited.",
    };
  }

  if (!isSaleEditable(sale.status, sale.end_date)) {
    return { ok: false, message: "Live listings can't be edited." };
  }

  return { ok: true };
}

export async function getSalePhotosState(
  saleId: string,
): Promise<ActionResult<SalePhotosState>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .select("id, operator_id")
    .eq("id", saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (saleErr || !sale) {
    return { ok: false, message: "Sale not found." };
  }

  const { data: op } = await supabase
    .from("operators")
    .select("tier")
    .eq("id", user.id)
    .maybeSingle();

  const tier = op?.tier ?? "free";

  const { data: photos, error: photoErr } = await supabase
    .from("sale_photos")
    .select("id, storage_path, sort_order, alt_text")
    .eq("sale_id", saleId)
    .order("sort_order", { ascending: true });

  if (photoErr) {
    return { ok: false, message: photoErr.message };
  }

  const rows = (photos ?? []) as SalePhotoRow[];
  const publicUrls = rows.map((p) => salePhotoPublicUrl(p.storage_path));

  return {
    ok: true,
    data: { photos: rows, publicUrls, tier },
  };
}

/**
 * Call after a successful client upload to `sale-photos` at `storagePath`.
 * Validates ownership, tier cap, and path shape.
 */
export async function registerSalePhotoAfterUpload(
  saleId: string,
  storagePath: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const prefix = expectedKeyPrefix(user.id, saleId);
  if (!storagePath.startsWith(prefix) || storagePath.includes("..")) {
    return { ok: false, message: "Invalid storage path." };
  }

  const editable = await assertSalePhotosEditable(supabase, saleId, user.id);
  if (!editable.ok) return editable;

  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .select("id, operator_id")
    .eq("id", saleId)
    .eq("operator_id", user.id)
    .maybeSingle();

  if (saleErr || !sale) {
    return { ok: false, message: "Sale not found." };
  }

  const { data: op } = await supabase
    .from("operators")
    .select("tier")
    .eq("id", user.id)
    .maybeSingle();

  const maxPhotos = maxPhotosForOperatorTier(op?.tier);

  const { count, error: countErr } = await supabase
    .from("sale_photos")
    .select("*", { count: "exact", head: true })
    .eq("sale_id", saleId);

  if (countErr) return { ok: false, message: countErr.message };
  if (
    Number.isFinite(maxPhotos) &&
    (count ?? 0) >= maxPhotos
  ) {
    return {
      ok: false,
      message: `Photo limit reached (${maxPhotos} on the free plan). Remove photos or upgrade to Pro for unlimited.`,
    };
  }

  const { data: existing } = await supabase
    .from("sale_photos")
    .select("sort_order")
    .eq("sale_id", saleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder =
    typeof existing?.sort_order === "number" ? existing.sort_order + 1 : 0;

  const { data: row, error: insErr } = await supabase
    .from("sale_photos")
    .insert({
      sale_id: saleId,
      storage_path: storagePath,
      sort_order: nextOrder,
      alt_text: null,
    })
    .select("id")
    .single();

  if (insErr || !row) {
    return { ok: false, message: insErr?.message ?? "Could not save photo." };
  }

  revalidatePath(`/dashboard/sales/${saleId}/pictures`);
  return { ok: true, data: { id: row.id } };
}

export async function deleteSalePhoto(
  saleId: string,
  photoId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const editable = await assertSalePhotosEditable(supabase, saleId, user.id);
  if (!editable.ok) return editable;

  const { data: photo, error: fetchErr } = await supabase
    .from("sale_photos")
    .select("id, storage_path, sale_id")
    .eq("id", photoId)
    .eq("sale_id", saleId)
    .maybeSingle();

  if (fetchErr || !photo) {
    return { ok: false, message: "Photo not found." };
  }

  const prefix = expectedKeyPrefix(user.id, saleId);
  if (!photo.storage_path.startsWith(prefix)) {
    return { ok: false, message: "Invalid photo path." };
  }

  const { error: rmErr } = await supabase.storage
    .from(SALE_PHOTOS_BUCKET)
    .remove([photo.storage_path]);

  if (rmErr) {
    return { ok: false, message: rmErr.message };
  }

  const { error: delErr } = await supabase
    .from("sale_photos")
    .delete()
    .eq("id", photoId)
    .eq("sale_id", saleId);

  if (delErr) {
    return { ok: false, message: delErr.message };
  }

  revalidatePath(`/dashboard/sales/${saleId}/pictures`);
  return { ok: true };
}
