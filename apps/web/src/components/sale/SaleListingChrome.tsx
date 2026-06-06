"use client";

import { useRef } from "react";
import Image from "next/image";
import { Building2, Sparkles, User } from "lucide-react";

import { SaleActionCard } from "@/components/sale/SaleActionCard";
import { SaleContactRunner } from "@/components/sale/SaleContactRunner";
import type { PublicOperator } from "@oes/types";
import { cn } from "@/lib/utils";

type ActionProps = {
  saleId: string;
  title: string;
  dateRange: string;
  previewTimes: string | null;
  city: string;
  state: string;
  zip: string | null;
  ended: boolean;
  addressIsExact: boolean;
  address: string | null;
  addressLine: string;
  lat: number | null;
  lng: number | null;
};

type HostProps = {
  operator: PublicOperator | undefined;
  viewCount: number;
};

export function SaleHostTrust({ operator, viewCount }: HostProps) {
  if (!operator) return null;

  const label = operator.company_name?.trim() || operator.name;
  const isCompany = operator.operator_kind === "company";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-accent ring-1 ring-border">
        {operator.company_logo_url ? (
          <Image
            src={operator.company_logo_url}
            alt=""
            width={44}
            height={44}
            className="size-full object-cover"
          />
        ) : isCompany ? (
          <Building2 className="size-5" aria-hidden />
        ) : (
          <User className="size-5" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">
          Hosted by{" "}
          <span className="font-semibold text-foreground">{label}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {isCompany ? (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-accent-foreground ring-1 ring-border">
              Professional company
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
              Independent host
            </span>
          )}
          {viewCount > 0 ? (
            <span>{viewCount.toLocaleString()} shoppers viewed this sale</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SaleCategoryChips({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground/85"
        >
          {category}
        </span>
      ))}
    </div>
  );
}

export function SaleFeaturedFinds({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="featured-finds-heading">
      <h2
        id="featured-finds-heading"
        className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
      >
        <Sparkles className="size-5 text-accent" aria-hidden />
        Featured finds
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/90 shadow-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SaleStickyActions({
  action,
  runnerLabel,
  contactEmail,
  className,
}: {
  action: ActionProps;
  runnerLabel: string;
  contactEmail: string | null;
  className?: string;
}) {
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={cn("space-y-5", className)}>
      <SaleActionCard {...action} onContact={scrollToContact} />
      <div ref={contactRef}>
        <SaleContactRunner
          saleTitle={action.title}
          runnerLabel={runnerLabel}
          contactEmail={contactEmail}
        />
      </div>
    </div>
  );
}
