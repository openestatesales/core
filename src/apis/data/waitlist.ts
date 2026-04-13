import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type JoinWaitlistResult =
  | { ok: true }
  | {
      ok: false;
      error: "config" | "client" | "server";
      message?: string;
    };

export function isWaitlistConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function joinWaitlist(email: string): Promise<JoinWaitlistResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, error: "config" };
  }

  const { error } = await supabase.functions.invoke("waitlist", {
    body: { email },
  });

  if (!error) {
    return { ok: true };
  }

  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response;
    const status = res.status;
    let message: string | undefined;
    try {
      const json: unknown = await res.json();
      if (
        typeof json === "object" &&
        json !== null &&
        "error" in json &&
        typeof (json as { error: unknown }).error === "string"
      ) {
        message = (json as { error: string }).error;
      }
    } catch {
      /* response body may be empty or non-JSON */
    }
    const kind = status >= 500 ? "server" : "client";
    return { ok: false, error: kind, message };
  }

  if (error instanceof FunctionsRelayError) {
    return { ok: false, error: "server", message: error.message };
  }

  if (error instanceof FunctionsFetchError) {
    return { ok: false, error: "client", message: error.message };
  }

  return { ok: false, error: "server", message: error.message };
}
