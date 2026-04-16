import Link from "next/link";

import { getSales } from "@/apis/data/sales";
import { salePublicPath } from "@/utils/sales";
import { absoluteUrl } from "@/utils/seo";
import type { Metadata } from "next";

type Props = { params: Promise<{ region: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const label = region.replace(/-/g, " ");
  return {
    title: `${label} estate sales`,
    alternates: {
      canonical: absoluteUrl(`/sales/${region}`),
    },
  };
}

export default async function SalesByRegionPage({ params }: Props) {
  const { region } = await params;
  const sales = await getSales({ regionSlug: region, limit: 100 });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Region · {region}
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase text-foreground">
        Estate sales
      </h1>
      <ul className="mt-8 space-y-3">
        {sales.map((s) => (
          <li key={s.id}>
            <Link
              href={salePublicPath(s.region_slug, s.listing_slug)}
              className="text-accent hover:underline"
            >
              {s.title}
            </Link>
            <span className="ml-2 text-sm text-muted-foreground">
              {s.start_date} — {s.end_date}
            </span>
          </li>
        ))}
      </ul>
      {sales.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          No published sales in this area yet.
        </p>
      ) : null}
    </main>
  );
}
