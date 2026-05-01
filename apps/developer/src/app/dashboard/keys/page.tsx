import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApiKeysClient } from "./ui";

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: keys } = await supabase
    .from("developer_api_keys")
    .select("id, name, key_prefix, scopes, created_at, last_used_at, revoked_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="kicker">Developer dashboard</p>
      <h1 className="h2" style={{ marginTop: 8 }}>
        API Keys
      </h1>
      <p className="lede" style={{ marginTop: 10 }}>
        Create a key to authenticate scripts and integrations. You’ll only see
        the secret once.
      </p>

      <div style={{ marginTop: 18 }}>
        <ApiKeysClient initialKeys={keys ?? []} />
      </div>
    </div>
  );
}

