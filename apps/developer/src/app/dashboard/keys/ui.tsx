"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMemo, useState } from "react";

type KeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[] | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

function fmt(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

export function ApiKeysClient({ initialKeys }: { initialKeys: KeyRow[] }) {
  const supabase = getSupabaseBrowserClient();
  const [keys, setKeys] = useState<KeyRow[]>(initialKeys);
  const [name, setName] = useState("Local script");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const canUse = useMemo(() => Boolean(supabase), [supabase]);

  async function refresh() {
    if (!supabase) return;
    const { data } = await supabase
      .from("developer_api_keys")
      .select("id, name, key_prefix, scopes, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false });
    setKeys((data ?? []) as KeyRow[]);
  }

  async function createKey() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setCreatedSecret(null);

    const { data, error } = await supabase.rpc("create_developer_api_key", {
      p_name: name,
      p_scopes: ["sales:write"],
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    setCreatedSecret(data as string);
    await refresh();
    setBusy(false);
  }

  async function revokeKey(id: string) {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setCreatedSecret(null);

    const { error } = await supabase.rpc("revoke_developer_api_key", {
      p_key_id: id,
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    await refresh();
    setBusy(false);
  }

  async function copySecret() {
    if (!createdSecret) return;
    await navigator.clipboard.writeText(createdSecret);
  }

  return (
    <div className="tiles" style={{ gridTemplateColumns: "1fr" }}>
      <div className="tile" style={{ cursor: "default" }}>
        <h3 className="tileTitle">Create a key</h3>
        <p className="tileBody">
          Name helps you remember where the key is used (CI, local script,
          integration).
        </p>

        {!canUse ? (
          <p className="tileBody" style={{ color: "rgba(255,255,255,0.78)" }}>
            Missing Supabase env configuration.
          </p>
        ) : null}

        {error ? (
          <div className="loginSplitError" role="alert">
            {error}
          </div>
        ) : null}

        <div className="ctaRow" style={{ marginTop: 14, gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="btn"
            style={{
              flex: 1,
              textAlign: "left",
              cursor: busy ? "not-allowed" : "text",
              opacity: busy ? 0.75 : 1,
            }}
            disabled={busy}
            aria-label="API key name"
          />
          <button
            type="button"
            className="btn btnPrimary"
            onClick={createKey}
            disabled={busy || !canUse}
            style={{ minWidth: 150, cursor: busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "Working…" : "Create key"}
          </button>
        </div>

        {createdSecret ? (
          <div style={{ marginTop: 14 }}>
            <p className="kicker" style={{ marginBottom: 8 }}>
              Secret (copy now)
            </p>
            <pre
              style={{
                margin: 0,
                padding: 14,
                borderRadius: 14,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.12)",
                overflowX: "auto",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {createdSecret}
            </pre>
            <div className="ctaRow" style={{ marginTop: 10 }}>
              <button type="button" className="btn" onClick={copySecret}>
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="tile" style={{ cursor: "default" }}>
        <h3 className="tileTitle">Your keys</h3>
        <p className="tileBody">
          Use the prefix to identify a key. Revoke any key you no longer need.
        </p>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {keys.length === 0 ? (
            <p className="tileBody" style={{ margin: 0 }}>
              No keys yet.
            </p>
          ) : (
            keys.map((k) => (
              <div
                key={k.id}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14 }}>{k.name}</strong>
                    <span style={{ opacity: 0.8, fontSize: 13 }}>
                      {k.key_prefix}…
                    </span>
                    {k.revoked_at ? (
                      <span style={{ opacity: 0.8, fontSize: 13 }}>
                        Revoked
                      </span>
                    ) : (
                      <span style={{ opacity: 0.8, fontSize: 13 }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                    Created: {fmt(k.created_at)} · Last used: {fmt(k.last_used_at)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => revokeKey(k.id)}
                    disabled={busy || Boolean(k.revoked_at) || !canUse}
                    style={{
                      cursor:
                        busy || k.revoked_at ? "not-allowed" : "pointer",
                      opacity: k.revoked_at ? 0.6 : 1,
                    }}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

