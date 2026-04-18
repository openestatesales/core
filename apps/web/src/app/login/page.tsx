"use client";

import { auth, type AuthResult } from "./actions";
import ForgotPassword from "@/components/ForgotPassword";
import { SiteLogo } from "@/components/icons/Logo";
import { loginSchema, type LoginFormData } from "@/form-schemas/login";
import type { Persona } from "@/lib/persona";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

const initialAuthState: AuthResult = { success: true };

function AuthErrorMessage({ state, isLogin }: { state: AuthResult; isLogin: boolean }) {
  if (state.success !== false) return null;

  const code = state.errorCode;
  const fallback = state.errorMessage ?? "Something went wrong.";

  if (isLogin) {
    if (code === "auth/invalid-credentials")
      return <p>Invalid email or password.</p>;
    if (code === "auth/user-not-found")
      return <p>No account found with that email.</p>;
    if (code === "auth/email-not-confirmed")
      return (
        <p>
          Confirm your email before signing in. Check your inbox for the link we
          sent.
        </p>
      );
    if (code === "auth/too-many-requests")
      return <p>Too many attempts. Please try again later.</p>;
    return <p>{fallback}</p>;
  }

  if (code === "auth/email-already-in-use")
    return <p>An account with this email already exists.</p>;
  if (code === "auth/weak-password")
    return <p>Password should be at least 6 characters.</p>;
  if (code === "auth/invalid-credentials")
    return <p>Please enter a valid email.</p>;
  if (code === "auth/too-many-requests")
    return <p>Too many attempts. Please try again later.</p>;
  return <p>{fallback}</p>;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const checkEmail = searchParams.get("checkEmail");
  const queryError = searchParams.get("error");

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signupPersona, setSignupPersona] = useState<Persona>("shopper");

  const [authState, authFormAction] = useActionState(auth, initialAuthState);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit((values) => {
    if (!isLogin && !agreedToTerms) return;
    const fd = new FormData();
    fd.set("intent", isLogin ? "login" : "signup");
    fd.set("email", values.email);
    fd.set("password", values.password);
    if (!isLogin) fd.set("terms", agreedToTerms ? "on" : "");
    if (!isLogin) fd.set("persona", signupPersona);
    startTransition(() => {
      authFormAction(fd);
    });
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/55 via-zinc-900/40 to-accent/15"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <SiteLogo className="mx-auto block [&_span:last-child]:text-white" />
            <p className="mt-3 text-sm text-white/85 drop-shadow">
              Sign in to browse or list. New accounts pick shopper or operator on sign up.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl dark:bg-black/25">
            {showForgotPassword ? (
              <ForgotPassword onDone={() => setShowForgotPassword(false)} />
            ) : (
              <>
                <div className="mb-6 flex rounded-lg bg-black/20 p-1 dark:bg-black/30">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isLogin
                        ? "bg-white/95 text-zinc-900 shadow-sm"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      !isLogin
                        ? "bg-white/95 text-zinc-900 shadow-sm"
                        : "text-white/85 hover:text-white"
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                {checkEmail ? (
                  <div className="mb-6 rounded-lg border border-accent/35 bg-accent/15 p-4 backdrop-blur-sm">
                    <p className="text-sm text-white">
                      <strong>Check your email</strong> — we sent a confirmation
                      link. You can sign in after you confirm.
                    </p>
                  </div>
                ) : null}

                {queryError === "auth" ? (
                  <div className="mb-6 rounded-lg border border-red-400/35 bg-red-500/15 p-4 text-sm text-red-100">
                    That sign-in link was invalid or expired. Try again.
                  </div>
                ) : null}

                {isLogin ? (
                  <div className="mb-6 rounded-lg border border-accent/25 bg-accent/10 p-4 backdrop-blur-sm">
                    <p className="text-sm text-white/95">
                      <strong>New here?</strong> Confirm your email after sign up
                      before signing in.
                    </p>
                  </div>
                ) : null}

                <form className="space-y-6" onSubmit={onSubmit} noValidate>
                  {authState.success === false ? (
                    <div className="rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-sm text-red-100">
                      <AuthErrorMessage state={authState} isLogin={isLogin} />
                    </div>
                  ) : null}

                  {!isLogin ? (
                    <div className="rounded-xl border border-white/20 bg-black/20 p-4">
                      <p className="mb-3 text-center text-sm font-medium text-white/95">
                        How are you using Open Estate Sales?
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setSignupPersona("shopper")}
                          className={cn(
                            "rounded-lg border px-3 py-3 text-left text-sm transition",
                            signupPersona === "shopper"
                              ? "border-accent bg-white/15 text-white shadow-sm"
                              : "border-white/15 text-white/80 hover:border-white/35",
                          )}
                        >
                          <span className="font-semibold">Shopper</span>
                          <span className="mt-1 block text-xs text-white/70">
                            Browse sales, save favorites, get alerts.
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupPersona("operator")}
                          className={cn(
                            "rounded-lg border px-3 py-3 text-left text-sm transition",
                            signupPersona === "operator"
                              ? "border-accent bg-white/15 text-white shadow-sm"
                              : "border-white/15 text-white/80 hover:border-white/35",
                          )}
                        >
                          <span className="font-semibold">Operator</span>
                          <span className="mt-1 block text-xs text-white/70">
                            List sales and manage your listings.
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-white/95"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="text"
                        autoComplete="email"
                        className="w-full rounded-lg border border-white/30 bg-white/15 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/45 backdrop-blur-sm focus:border-accent focus:ring-2 focus:ring-accent/40"
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      {errors.email ? (
                        <p className="mt-2 text-sm text-red-200">
                          {errors.email.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-white/95"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                        className="w-full rounded-lg border border-white/30 bg-white/15 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/45 backdrop-blur-sm focus:border-accent focus:ring-2 focus:ring-accent/40"
                        placeholder="••••••••"
                        {...register("password")}
                      />
                      {errors.password ? (
                        <p className="mt-2 text-sm text-red-200">
                          {errors.password.message}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
                      </button>
                    </div>
                  </div>

                  {isLogin ? (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  ) : null}

                  {!isLogin ? (
                    <div className="flex items-start gap-3">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/40 bg-white/15 text-accent focus:ring-accent/50"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-white/90"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="font-medium text-accent hover:underline"
                        >
                          Terms &amp; conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="font-medium text-accent hover:underline"
                        >
                          Privacy policy
                        </Link>
                        .
                      </label>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={
                      pending || (!isLogin && !agreedToTerms)
                    }
                    className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending
                      ? isLogin
                        ? "Signing in…"
                        : "Creating account…"
                      : isLogin
                        ? "Sign in"
                        : "Create account"}
                  </button>
                </form>
              </>
            )}
          </div>

          {!showForgotPassword ? (
            <div className="mt-8 text-center">
              <p className="text-sm text-white/90 drop-shadow">
                {isLogin ? "No account yet? " : "Already registered? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                  }}
                  className="font-medium text-accent hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
