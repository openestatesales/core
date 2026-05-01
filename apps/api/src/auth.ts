import { createSupabaseAdmin } from "./supabase-admin";
import type { ApiEnv } from "./env";
import { createHash } from "node:crypto";

export type ApiKeyAuth = {
  developerId: string;
  scopes: string[];
  keyId: string;
};

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function verifyApiKey(
  env: ApiEnv,
  authorizationHeader: string | null,
): Promise<ApiKeyAuth | null> {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  const keyHash = sha256Hex(token);
  const supabase = createSupabaseAdmin(env);

  const { data, error } = await supabase
    .from("developer_api_keys")
    .select("id, developer_id, scopes, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at) return null;

  // Best-effort audit.
  await supabase
    .from("developer_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    developerId: data.developer_id,
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
    keyId: data.id,
  };
}

