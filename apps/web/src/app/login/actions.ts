"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/form-schemas/login";
import { redirect } from "next/navigation";
import { z } from "zod";

const zEmail = z.string().email();

export type AuthResult = {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
};

function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

function mapAuthError(error: { message: string }): AuthResult {
  const msg = error.message.toLowerCase();
  if (
    msg.includes("invalid login") ||
    msg.includes("invalid credentials")
  ) {
    return {
      success: false,
      errorCode: "auth/invalid-credentials",
      errorMessage: error.message,
    };
  }
  if (msg.includes("email not confirmed")) {
    return {
      success: false,
      errorCode: "auth/email-not-confirmed",
      errorMessage: error.message,
    };
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered") ||
    msg.includes("already registered")
  ) {
    return {
      success: false,
      errorCode: "auth/email-already-in-use",
      errorMessage: error.message,
    };
  }
  if (msg.includes("password")) {
    return {
      success: false,
      errorCode: "auth/weak-password",
      errorMessage: error.message,
    };
  }
  if (msg.includes("rate") || msg.includes("too many")) {
    return {
      success: false,
      errorCode: "auth/too-many-requests",
      errorMessage: error.message,
    };
  }
  if (msg.includes("user not found") || msg.includes("no user")) {
    return {
      success: false,
      errorCode: "auth/user-not-found",
      errorMessage: error.message,
    };
  }
  return {
    success: false,
    errorCode: "default",
    errorMessage: error.message,
  };
}

export async function login(formData: FormData): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid input.";
    return {
      success: false,
      errorCode: "default",
      errorMessage: first,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return mapAuthError(error);
  const next = String(formData.get("next") ?? "/dashboard") || "/dashboard";
  redirect(next);
}

export async function signup(formData: FormData): Promise<AuthResult> {
  if (formData.get("terms") !== "on") {
    return {
      success: false,
      errorCode: "default",
      errorMessage: "You must accept the terms to create an account.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid input.";
    return {
      success: false,
      errorCode: "default",
      errorMessage: first,
    };
  }

  const supabase = await createClient();
  const origin = siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return mapAuthError(error);
  const next = String(formData.get("next") ?? "/dashboard") || "/dashboard";
  if (data.session) redirect(next);
  redirect("/login?checkEmail=1");
}

export type PasswordResetResult = {
  success: boolean;
  errorMessage?: string;
};

export async function requestPasswordReset(
  formData: FormData,
): Promise<PasswordResetResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { success: false, errorMessage: "Enter your email." };
  }
  const parsed = zEmail.safeParse(email);
  if (!parsed.success) {
    return { success: false, errorMessage: "Enter a valid email." };
  }

  const supabase = await createClient();
  const origin = siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data,
    {
      redirectTo: `${origin}/auth/callback?next=/login`,
    },
  );

  if (error) {
    return { success: false, errorMessage: error.message };
  }
  return { success: true };
}

export async function auth(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const intent = String(formData.get("intent") ?? "login");
  if (intent === "signup") return signup(formData);
  return login(formData);
}
