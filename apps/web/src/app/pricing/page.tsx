import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free forever operator tier and AI Empowered — open estate sale listings without closed-directory lock-in.",
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

const aiFeatures = [
  "Unlimited photos",
  "AI-assisted listings — auto-categorize & describe items",
  "OAuth & API access for integrations",
  "Gold operator badge",
  "Priority access to leads",
  "Extended retention for media & listing history",
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
          We&apos;re building the free, open alternative to closed directories. Our{" "}
          <strong className="font-semibold text-foreground">Free Forever</strong>&nbsp;tier is 
          designed to feel like what you&apos;d expect from a{" "}
          <strong className="font-semibold text-foreground">Pro tier</strong>&nbsp;elsewhere. 
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8 md:items-stretch">
        {/* Free Forever — recommended */}
        <section
          className={cn(
            "relative flex flex-col rounded-2xl border-2 border-accent bg-card p-6 shadow-sm md:p-8",
            "ring-2 ring-accent/20",
          )}
          aria-labelledby="tier-free-heading"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Recommended
            </span>
          </div>

          <div className="mb-6 pt-2 text-center">
            <h2
              id="tier-free-heading"
              className="font-display text-2xl uppercase tracking-tight text-foreground"
            >
              Free Forever
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything most operators need — no card required.
            </p>
            <p className="mt-4 font-display text-4xl font-normal tabular-nums text-foreground md:text-5xl">
              $0
            </p>
            <p className="text-sm text-muted-foreground">per month · forever</p>
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
            Get started free
          </Link>
        </section>

        {/* AI Empowered */}
        <section
          className="flex flex-col rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8 dark:bg-zinc-950/40"
          aria-labelledby="tier-ai-heading"
        >
          <div className="mb-6 flex items-center justify-center gap-2 text-center">
            <Sparkles className="size-6 text-accent" aria-hidden strokeWidth={2} />
            <h2
              id="tier-ai-heading"
              className="font-display text-2xl uppercase tracking-tight text-foreground"
            >
              AI Empowered
            </h2>
          </div>
          <div className="mb-4 mx-auto max-w-sm space-y-2 text-center text-sm leading-relaxed text-muted-foreground">
            <p>For operators who need more photos and advanced workflows.</p>
          </div>
          <p className="mb-6 text-center">
            <span className="font-display text-4xl tabular-nums text-foreground md:text-5xl">
              $99
            </span>
            <span className="text-muted-foreground"> /month</span>
          </p>

          <ul className="flex flex-1 flex-col gap-3 text-sm text-foreground/95">
            {aiFeatures.map((line) => (
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
              buttonVariants({ variant: "default", size: "default" }),
              "mt-8 w-full bg-accent font-semibold text-white hover:bg-accent/90",
            )}
          >
            Upgrade when ready
          </Link>
        </section>
      </div>

      <section
        className="rounded-2xl border border-dashed border-border bg-muted/40 px-5 py-6 text-sm leading-relaxed text-muted-foreground sm:px-8 sm:py-8"
        aria-labelledby="pricing-why-heading"
      >
        <h3 id="pricing-why-heading" className="mb-3 font-semibold text-foreground">
          Why a Pro tier at all?
        </h3>
        <p className="mb-3">
          Our mission is to make{" "}
          <strong className="text-foreground">estate sale listings free forever</strong> for
          operators and shoppers. Running inference for auto-categorization and descriptions,
          keeping unlimited media online long-term, and offering OAuth/API access all carry real
          infrastructure cost — so{" "}
          <strong className="text-foreground">AI Empowered</strong> exists for teams who need
          that power and help cover those costs.
        </p>
        <p>
          The free tier stays generous on purpose (similar in spirit to premium &quot;Silver&quot;
          plans on other sites — but actually $0). If you&apos;re listing occasionally and can
          work within 60-day retention and photo limits, you may never need to pay.
        </p>
      </section>
    </div>
  );
}
