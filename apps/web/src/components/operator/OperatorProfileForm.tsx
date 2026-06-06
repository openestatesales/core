"use client";

import { updateOperatorProfile } from "@/app/dashboard/profile/actions";
import { DashboardSection } from "@/components/operator/dashboard/DashboardPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  operatorProfileSchema,
  type OperatorProfileFormValues,
} from "@/form-schemas/operator-profile";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

type OperatorRow = {
  name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  company_name: string | null;
  operator_kind: "individual" | "company";
  company_logo_url: string | null;
};

type Props = {
  initial: OperatorRow;
  email: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

export function OperatorProfileForm({ initial, email }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const form = useForm<OperatorProfileFormValues>({
    resolver: zodResolver(operatorProfileSchema),
    defaultValues: {
      name: initial.name,
      phone: initial.phone ?? "",
      city: initial.city ?? "",
      state: initial.state ?? "",
      operator_kind: initial.operator_kind,
      company_name: initial.company_name ?? "",
      company_logo_url: initial.company_logo_url ?? "",
    },
  });

  const kind = useWatch({
    control: form.control,
    name: "operator_kind",
    defaultValue: initial.operator_kind,
  });
  const logoUrl = useWatch({
    control: form.control,
    name: "company_logo_url",
    defaultValue: initial.company_logo_url ?? "",
  });

  async function onSubmit(values: OperatorProfileFormValues) {
    setServerError(null);
    const result = await updateOperatorProfile(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2500);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {(form.formState.errors.root || serverError) && (
        <div
          className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{serverError ?? form.formState.errors.root?.message}</span>
        </div>
      )}

      <DashboardSection
        title="Business information"
        description="How your name and branding appear on public listings."
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Business type</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border p-3 transition-colors",
                kind === "individual"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                value="individual"
                {...form.register("operator_kind")}
              />
              <span className="font-medium">Private / one-off</span>
              <span className="text-muted-foreground text-xs">
                Personal or occasional sales.
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border p-3 transition-colors",
                kind === "company"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                value="company"
                {...form.register("operator_kind")}
              />
              <span className="font-medium">Company</span>
              <span className="text-muted-foreground text-xs">
                Business or team name on listings.
              </span>
            </label>
          </div>
        </div>

        {kind === "company" ? (
          <>
            <div className="space-y-2">
              <label htmlFor="company_name" className="text-sm font-medium">
                Company name
              </label>
              <Input
                id="company_name"
                {...form.register("company_name")}
                autoComplete="organization"
              />
              <FieldError message={form.formState.errors.company_name?.message} />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_logo_url" className="text-sm font-medium">
                Company logo URL{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                id="company_logo_url"
                type="url"
                placeholder="https://…"
                {...form.register("company_logo_url")}
              />
              <FieldError message={form.formState.errors.company_logo_url?.message} />
              {logoUrl?.trim() ? (
                <div className="border-border mt-2 overflow-hidden rounded-lg border bg-background p-3">
                  <p className="text-muted-foreground mb-2 text-xs">Preview</p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied HTTPS URL */}
                  <img
                    src={logoUrl.trim()}
                    alt=""
                    className="mx-auto max-h-20 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </DashboardSection>

      <DashboardSection title="Contact information">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            {kind === "company" ? "Contact name" : "Your name"}
          </label>
          <Input id="name" {...form.register("name")} autoComplete="name" />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input id="phone" type="tel" {...form.register("phone")} autoComplete="tel" />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" value={email} disabled readOnly />
          <p className="text-muted-foreground text-xs">
            Sign-in email; change it from your account provider if needed.
          </p>
        </div>
      </DashboardSection>

      <DashboardSection title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <Input id="city" {...form.register("city")} autoComplete="address-level2" />
          </div>
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium">
              State
            </label>
            <Input
              id="state"
              maxLength={2}
              {...form.register("state")}
              autoComplete="address-level1"
            />
          </div>
        </div>
      </DashboardSection>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
        {justSaved && !form.formState.isSubmitting ? (
          <span className="text-muted-foreground text-sm">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}
