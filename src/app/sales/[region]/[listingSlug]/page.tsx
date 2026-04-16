import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicSale } from "@/apis/data/sales";
import { absoluteUrl, canonicalSaleUrl } from "@/utils/seo";
import { salePublicPath } from "@/utils/sales";

type Props = {
  params: Promise<{ region: string; listingSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, listingSlug } = await params;
  const sale = await getPublicSale(region, listingSlug);
  if (!sale) {
    return { title: "Sale not found" };
  }
  const title = `${sale.title} — ${sale.city}, ${sale.state}`;
  const description =
    sale.description?.slice(0, 155) ??
    `Estate sale in ${sale.city}, ${sale.state}. ${sale.start_date} to ${sale.end_date}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalSaleUrl(region, listingSlug),
      type: "website",
    },
    alternates: {
      canonical: canonicalSaleUrl(region, listingSlug),
    },
  };
}

export default async function SaleDetailPage({ params }: Props) {
  const { region, listingSlug } = await params;
  const sale = await getPublicSale(region, listingSlug);

  if (!sale) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: sale.title,
    startDate: sale.start_date,
    endDate: sale.end_date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: `${sale.city}, ${sale.state}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: sale.city,
        addressRegion: sale.state,
        ...(sale.zip ? { postalCode: sale.zip } : {}),
        ...(sale.address ? { streetAddress: sale.address } : {}),
      },
    },
    url: absoluteUrl(salePublicPath(sale.region_slug, sale.listing_slug)),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/sales" className="hover:text-accent">
          Sales
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/sales/${sale.region_slug}`}
          className="hover:text-accent"
        >
          {sale.region_slug}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground/70">{sale.listing_slug}</span>
      </nav>

      <h1 className="mt-6 font-display text-4xl uppercase text-foreground">
        {sale.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {sale.city}, {sale.state}
        {sale.zip ? ` · ${sale.zip}` : null}
      </p>
      <p className="mt-4 text-foreground/90">
        {sale.start_date} — {sale.end_date}
      </p>
      {sale.description ? (
        <p className="mt-6 whitespace-pre-wrap text-foreground/85">
          {sale.description}
        </p>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
