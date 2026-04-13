import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }

  const emailRaw =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email
      : undefined

  if (emailRaw === undefined) {
    return json({ error: "Email required" }, 400)
  }

  const email = emailRaw.trim().toLowerCase()
  if (email.length === 0 || email.length > 320) {
    return json({ error: "Invalid email" }, 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return json({ error: "Invalid email" }, 400)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return json({ error: "Server misconfigured" }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const { error } = await supabase.from("waitlist").insert({ email })

  if (error) {
    if (error.code === "23505") {
      // Duplicate — same success as new signup (avoid email enumeration).
      return json({ ok: true })
    }
    console.error(error)
    return json({ error: "Could not save" }, 500)
  }

  return json({ ok: true })
})
