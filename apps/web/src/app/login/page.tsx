"use client";

import { auth, type AuthResult } from "./actions";
import ForgotPassword from "@/components/ForgotPassword";
import { SiteLogo } from "@/components/icons/Logo";
import { loginSchema, type LoginFormData } from "@/form-schemas/login";
import type { Persona } from "@/lib/persona";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, MapPin, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

const initialAuthState: AuthResult = { success: true };

const OPERATOR_BENEFITS = [
  {
    Icon: Sparkles,
    title: "Free forever",
    body: "No subscription or per-listing fees—list with us while you grow.",
  },
  {
    Icon: MapPin,
    title: "Map-ready discovery",
    body: "Fuzzy pins, clear dates, and search-friendly listings so locals find you.",
  },
  {
    Icon: CalendarRange,
    title: "Photos & schedules",
    body: "Show what’s inside and when you’re open—everything shoppers need to plan a visit.",
  },
  {
    Icon: Store,
    title: "Operator workflows",
    body: "Draft, publish, and manage sales in one place—built for small teams.",
  },
] as const;

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

const SPLIT_PANE_PADDING =
  "px-6 py-12 sm:px-10 lg:px-12 lg:py-16 xl:px-14";
const SPLIT_INNER = "mx-auto w-full max-w-lg";

function OperatorBenefitsAside({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col justify-center overflow-hidden border-t border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-accent/25 lg:border-t-0",
        className,
      )}
      aria-label="Why operators use Open Estate Sales"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_18%_12%,oklch(0.45_0.12_238/0.4),transparent_55%),radial-gradient(700px_420px_at_92%_88%,oklch(0.35_0.1_258/0.28),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" aria-hidden />
      <div className={cn("relative z-10", SPLIT_INNER)}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-100 shadow-[0_0_24px_oklch(0.55_0.14_238/0.28)]">
          <span
            className="size-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_0_3px_oklch(0.62_0.14_238/0.4)]"
            aria-hidden
          />
          Free forever — for operators
        </div>
        <h2 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          List estate sales without the platform tax.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Shoppers browse free; operators list free. Same account—pick shopper or
          operator when you sign up.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-3.5">
          {OPERATOR_BENEFITS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15 text-sky-200">
                <Icon className="size-4" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/72">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
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

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div
      className={cn(
        "grid min-h-0 w-full min-w-0 grid-cols-1",
        "min-h-[calc(100dvh-4.75rem)] lg:min-h-[calc(100dvh-5rem)]",
        "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:items-stretch",
        "lg:divide-x lg:divide-border/90 dark:lg:divide-border/60",
      )}
    >
      {/* Form column: first on mobile, right half on lg */}
      <div
        className={cn(
          "order-1 flex min-h-0 min-w-0 flex-col justify-center bg-background",
          SPLIT_PANE_PADDING,
          "lg:order-2",
        )}
      >
        <div className={SPLIT_INNER}>
          <div className="mb-8 text-left">
            <SiteLogo className="inline-flex" />
            <p className="mt-3 text-sm text-muted-foreground">
              Sign in to browse or list. New accounts pick shopper or operator on
              sign up.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {showForgotPassword ? (
              <ForgotPassword onDone={() => setShowForgotPassword(false)} />
            ) : (
              <>
                <div className="mb-6 flex rounded-lg bg-muted/80 p-1 dark:bg-muted/50">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={cn(
                      "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                      isLogin
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={cn(
                      "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                      !isLogin
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Sign up
                  </button>
                </div>

                {checkEmail ? (
                  <div className="mb-6 rounded-lg border border-primary/25 bg-primary/10 p-4">
                    <p className="text-sm text-foreground">
                      <strong>Check your email</strong> — we sent a confirmation
                      link. You can sign in after you confirm.
                    </p>
                  </div>
                ) : null}

                {queryError === "auth" ? (
                  <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    That sign-in link was invalid or expired. Try again.
                  </div>
                ) : null}

                {isLogin ? (
                  <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm text-foreground">
                      <strong>New here?</strong> Confirm your email after sign up
                      before signing in.
                    </p>
                  </div>
                ) : null}

                <form className="space-y-6" onSubmit={onSubmit} noValidate>
                  {authState.success === false ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      <AuthErrorMessage state={authState} isLogin={isLogin} />
                    </div>
                  ) : null}

                  {!isLogin ? (
                    <div className="rounded-xl border border-border bg-muted/40 p-4">
                      <p className="mb-3 text-center text-sm font-medium text-foreground">
                        How are you using Open Estate Sales?
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setSignupPersona("shopper")}
                          className={cn(
                            "rounded-lg border px-3 py-3 text-left text-sm transition",
                            signupPersona === "shopper"
                              ? "border-primary bg-primary/10 text-foreground shadow-sm"
                              : "border-border text-muted-foreground hover:border-input",
                          )}
                        >
                          <span className="font-semibold">Shopper</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Browse sales, save favorites, get alerts.
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupPersona("operator")}
                          className={cn(
                            "rounded-lg border px-3 py-3 text-left text-sm transition",
                            signupPersona === "operator"
                              ? "border-primary bg-primary/10 text-foreground shadow-sm"
                              : "border-border text-muted-foreground hover:border-input",
                          )}
                        >
                          <span className="font-semibold">Operator</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            List sales and manage your listings.
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="text"
                        autoComplete="email"
                        className={cn(inputClass, "pr-10")}
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      {errors.email ? (
                        <p className="mt-2 text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-foreground"
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
                        className={cn(inputClass, "pr-12")}
                        placeholder="••••••••"
                        {...register("password")}
                      />
                      {errors.password ? (
                        <p className="mt-2 text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
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
                        className="text-sm font-medium text-primary hover:underline"
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
                        className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="font-medium text-primary hover:underline"
                        >
                          Terms &amp; conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="font-medium text-primary hover:underline"
                        >
                          Privacy policy
                        </Link>
                        .
                      </label>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={pending || (!isLogin && !agreedToTerms)}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mt-8 text-left">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "No account yet? " : "Already registered? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <OperatorBenefitsAside
        className={cn("order-2 lg:order-1", SPLIT_PANE_PADDING)}
      />
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
        <div className="flex min-h-[calc(100dvh-4.75rem)] items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
