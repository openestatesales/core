import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Heart, MapPin, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Open Estate Sales exists so estate sale listings belong on the open web — free for operators, free for shoppers.",
};

const beliefs = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Listings should be findable",
    body: "When someone downsizes, settles an estate, or clears a house, neighbors deserve a clear, honest way to discover what's for sale — without paywalls or proprietary silos.",
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Operators shouldn't pay to reach buyers",
    body: "Estate sale companies run on tight margins. Charging operators per listing or per click is a tax on small businesses doing honest work in their communities.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Community over gatekeeping",
    body: "Closed directories hoard data that should be public. We believe the people running sales and the people shopping them should own the relationship — not a middleman.",
  },
  {
    icon: <Compass className="h-5 w-5" />,
    title: "Built in the open",
    body: "Our code is AGPL-3.0. Anyone can inspect it, run it, fork it, and improve it. Transparency isn't a marketing line — it's how we stay accountable.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-14 sm:px-6 md:py-20">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          About
        </div>
        <h1 className="font-display text-4xl uppercase tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Estate sales belong{" "}
          <span className="text-accent">on the open web.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Open Estate Sales is an open-source platform for discovering and publishing estate
          sales. We exist because listing a sale shouldn&apos;t cost money, and finding one
          shouldn&apos;t require an account with a closed directory.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
        <div className="space-y-5 p-8 md:p-10">
          <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">
            Our mission
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Make estate sale listings as easy to share and discover as any other public event —
            free for operators, free for shoppers, and owned by the community instead of a single
            paid gatekeeper.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Every weekend, thousands of estate sales happen in driveways, garages, and living
            rooms across the country. For decades, a handful of closed platforms decided who
            could see those listings and what operators had to pay for the privilege. We&apos;re
            building the alternative: map-ready listings, operator tools, and public data that
            stays public.
          </p>
        </div>
      </section>

      <section aria-labelledby="beliefs-heading" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2
            id="beliefs-heading"
            className="font-display text-2xl uppercase tracking-tight text-foreground"
          >
            What we believe
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
            These aren&apos;t slogans — they&apos;re the constraints we design against every day.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {beliefs.map((item) => (
            <div
              key={item.title}
              className="relative space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40" />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold leading-tight text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center sm:px-10">
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
          Open Estate Sales is a living open-source project — not a venture-backed directory
          playing the long con. If this mission resonates, browse{" "}
          <Link href="/sales" className="font-medium text-accent hover:underline">
            sales near you
          </Link>
          , read about{" "}
          <Link href="/pricing" className="font-medium text-accent hover:underline">
            our pricing
          </Link>
          , or{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            list your first sale
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sales"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-accent px-8 font-bold text-white hover:bg-accent/90",
            )}
          >
            Browse sales
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            List a sale
          </Link>
        </div>
      </section>
    </div>
  );
}
