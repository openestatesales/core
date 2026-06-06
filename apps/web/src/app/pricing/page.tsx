import type { Metadata } from "next";
import Link from "next/link";
import { Check, Code2, Globe, Lock, Unlock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free operator tier — open estate sale listings without closed-directory lock-in.",
};

const freeFeatures = [
  "Up to 200 photos per sale",
  "Unlimited estate sale listings",
  "Searchable public listings",
  "60-day listing retention",
];

const principles = [
  {
    icon: <Unlock className="h-5 w-5" />,
    title: "No operator fees. Ever.",
    body: "Listing your sales is free today and will stay free. We will never charge operators to reach buyers.",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Open by design.",
    body: "Estate sale listings belong on the open web — not locked behind a closed directory that charges for visibility.",
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Open source, AGPL-3.0.",
    body: "The platform is fully open source. Anyone can inspect, fork, or contribute. No black boxes.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-14 sm:px-6 md:py-20">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Pricing
        </div>
        <h1 className="font-display text-4xl uppercase tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Free. <span className="text-accent">Forever.</span>
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Operators should never pay to list estate sales.
        </p>
      </header>

      <div className="relative">
        <div className="absolute inset-0 -z-10 scale-95 rounded-3xl bg-accent/10 blur-2xl" />

        <section
          className={cn(
            "relative flex flex-col overflow-hidden rounded-2xl border-2 border-accent bg-card shadow-sm",
            "ring-2 ring-accent/20",
          )}
          aria-labelledby="tier-free-heading"
        >
          <div className="h-1 w-full bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

          <div className="p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2
                    id="tier-free-heading"
                    className="font-display text-3xl uppercase tracking-tight text-foreground"
                  >
                    Free
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold tracking-wide text-accent">
                    FOREVER
                  </span>
                </div>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Everything an operator needs to publish, promote, and grow — at no cost.
                </p>
                <div className="flex items-end gap-1 pt-2">
                  <span className="font-display text-6xl font-normal tabular-nums leading-none text-foreground">
                    $0
                  </span>
                  <span className="pb-2 text-sm text-muted-foreground">/ month</span>
                </div>
              </div>

              <ul className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-foreground/90 sm:grid-cols-2 md:max-w-sm">
                {freeFeatures.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden
                      strokeWidth={2.5}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full bg-accent px-10 font-bold text-white hover:bg-accent/90 sm:w-auto",
                )}
              >
                Get started free
              </Link>
              <p className="text-xs text-muted-foreground">
                No credit card. No trial period. No catch.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="why-free-heading" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2
            id="why-free-heading"
            className="font-display text-2xl uppercase tracking-tight text-foreground"
          >
            Why free?
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
            Estate sale data has been locked inside closed directories for too long.
            We&apos;re building the open alternative.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="relative space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40" />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                {p.icon}
              </div>
              <h3 className="text-sm font-semibold leading-tight text-foreground">{p.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-8 sm:px-10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">The old model is broken.</h3>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Closed directories charge operators to list, charge buyers to view, and hoard data
              that should be public. Open Estate Sales is AGPL-3.0 licensed — the listings,
              the code, and the community are open. Operators keep their audience.
              Buyers find sales for free. That&apos;s how it should work.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
