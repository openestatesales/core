import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free operator tier — open estate sale listings without closed-directory lock-in.",
};

const freeFeatures = [
  "Up to 200 photos per sale",
  "Unlimited free estate sales",
  "Company profile page",
  "Searchable public listings",
  "Standard access to client leads",
  "Access to marketing tools",
  "60-day listing retention (then archived to keep storage sustainable)",
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 md:py-16">
      <header className="text-center">
        <h1 className="font-display text-3xl uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Simple, honest{" "}
          <span className="text-accent">pricing</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Estate sale listings should be public and easy to find.{" "}
          <strong className="font-semibold text-foreground">
            Open Estate Sales is free for operators.
          </strong>
        </p>
      </header>

      <div className="grid gap-6 md:items-stretch">
        <section
          className={cn(
            "relative flex flex-col rounded-2xl border-2 border-accent bg-card p-6 shadow-sm md:p-8",
            "ring-2 ring-accent/20",
          )}
          aria-labelledby="tier-free-heading"
        >
          <div className="mb-6 pt-2 text-center">
            <h2
              id="tier-free-heading"
              className="font-display text-2xl uppercase tracking-tight text-foreground"
            >
              Free
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything operators need to publish estate sales.
            </p>
            <p className="mt-4 font-display text-4xl font-normal tabular-nums text-foreground md:text-5xl">
              $0
            </p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>

          <ul className="flex flex-1 flex-col gap-3 text-sm text-foreground/95">
            {freeFeatures.map((line) => (
              <li key={line} className="flex gap-3">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden
                  strokeWidth={2.5}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "mt-8 w-full font-semibold",
            )}
          >
            Get started
          </Link>
        </section>
      </div>

      <section
        className="rounded-2xl border border-dashed border-border bg-muted/40 px-5 py-6 text-sm leading-relaxed text-muted-foreground sm:px-8 sm:py-8"
        aria-labelledby="pricing-why-heading"
      >
        <h3 id="pricing-why-heading" className="mb-3 font-semibold text-foreground">
          What’s included today
        </h3>
        <p>
          We’re keeping pricing simple while we build. The current tier includes generous photo
          limits, public listings, and company profiles—without paywalls.
        </p>
      </section>
    </div>
  );
}
