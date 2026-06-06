import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarRange,
  Camera,
  ChevronDown,
  Clock,
  MapPin,
} from "lucide-react";

import { getPublicSale } from "@/apis/data/sales";
import { SaleDescriptionHtml } from "@/components/sale/SaleDescriptionHtml";
import {
  SaleCategoryChips,
  SaleFeaturedFinds,
  SaleHostTrust,
  SaleStickyActions,
} from "@/components/sale/SaleListingChrome";
import { SalePhotoCarousel } from "@/components/sale/SalePhotoCarousel";
import { SalePhotoMasonry } from "@/components/sale/SalePhotoMasonry";
import SaleDetailMap from "@/components/sale/SaleDetailMap";
import {
  inferFeaturedFinds,
  inferSaleCategories,
  saleAboutIntro,
} from "@/lib/sale-listing-insights";
import { publicSaleToExploreSale } from "@/lib/map/public-sale-to-explore-sale";
import { salePhotoPublicUrl } from "@/config/sale-photos";
import { plainTextFromHtml } from "@/utils/html";
import { absoluteUrl, canonicalSaleUrl } from "@/utils/seo";
import { salePublicPath } from "@/utils/sales";

type Props = {
  params: Promise<{ region: string; listingSlug: string }>;
};

function isSaleEnded(endDate: string): boolean {
  return endDate < new Date().toISOString().slice(0, 10);
}

function formatUsDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatDateRange(start: string, end: string): string {
  if (start === end) return formatUsDate(start);
  return `${formatUsDate(start)} – ${formatUsDate(end)}`;
}

function formatRevealAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, listingSlug } = await params;
  const sale = await getPublicSale(region, listingSlug);
  if (!sale) return { title: "Sale not found" };

  const plain = plainTextFromHtml(sale.description ?? "");
  const description =
    plain.slice(0, 155).trim() ||
    `Estate sale in ${sale.city}, ${sale.state}. ${sale.start_date} – ${sale.end_date}.`;
  const title = `${sale.title} — ${sale.city}, ${sale.state}`;
  const photos = [...(sale.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const firstSrc = photos[0] ? salePhotoPublicUrl(photos[0].storage_path) : null;

  return {
    title,
    description,
    openGraph: {
      title: sale.title,
      description,
      url: canonicalSaleUrl(region, listingSlug),
      type: "website",
      ...(firstSrc
        ? { images: [{ url: firstSrc, width: 1200, height: 630, alt: sale.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: sale.title,
      description,
      ...(firstSrc ? { images: [firstSrc] } : {}),
    },
    alternates: { canonical: canonicalSaleUrl(region, listingSlug) },
  };
}

export default async function SaleDetailPage({ params }: Props) {
  const { region, listingSlug } = await params;
  const sale = await getPublicSale(region, listingSlug);
  if (!sale) notFound();

  const explore = publicSaleToExploreSale(sale);
  const ended = isSaleEnded(sale.end_date);
  const hasMapPin = typeof explore.lat === "number" && typeof explore.lng === "number";
  const addressIsExact = sale.lat != null && sale.lng != null && Boolean(sale.address);

  const sortedPhotos = [...(sale.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const photoCount = sortedPhotos.length;
  const runnerLabel =
    sale.operator?.company_name?.trim() || sale.operator?.name || "the host";

  const dateRange = formatDateRange(sale.start_date, sale.end_date);
  const categories = inferSaleCategories(sale.description);
  const featuredFinds = inferFeaturedFinds(sale.description);
  const aboutIntro = saleAboutIntro(sale.description);

  const addressLine =
    addressIsExact && sale.address
      ? sale.address
      : sale.address_reveal_at
        ? `Exact address releases ${formatRevealAt(sale.address_reveal_at)}`
        : "Exact address shared before the sale starts";

  const actionProps = {
    saleId: sale.id,
    title: sale.title,
    dateRange,
    previewTimes: sale.preview_times,
    city: sale.city,
    state: sale.state,
    zip: sale.zip,
    ended,
    addressIsExact,
    address: sale.address,
    addressLine,
    lat: sale.lat,
    lng: sale.lng,
  };

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All sales
        </Link>

        <SalePhotoCarousel title={sale.title} photos={sortedPhotos} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-8">
            <header className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              {ended ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                  <AlertCircle className="size-3.5" aria-hidden />
                  This sale has ended
                </span>
              ) : null}

              <div>
                <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                  {sale.title}
                </h1>
                {photoCount > 0 && categories.length > 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <Camera className="mr-1 inline size-3.5 text-accent" aria-hidden />
                    {photoCount} {photoCount === 1 ? "photo" : "photos"}
                    {" · "}
                    {categories.slice(0, 3).join(" · ")}
                  </p>
                ) : photoCount > 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <Camera className="mr-1 inline size-3.5 text-accent" aria-hidden />
                    {photoCount} {photoCount === 1 ? "photo" : "photos"}
                  </p>
                ) : null}
              </div>

              <SaleHostTrust operator={sale.operator ?? undefined} viewCount={sale.view_count} />

              <div className="flex flex-col gap-2 text-sm text-foreground/85 sm:flex-row sm:flex-wrap sm:gap-x-5">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
                  {sale.city}, {sale.state}
                  {sale.zip ? ` ${sale.zip}` : ""}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarRange className="size-4 shrink-0 text-accent" aria-hidden />
                  {dateRange}
                </span>
                {sale.preview_times?.trim() ? (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="size-4 shrink-0 text-accent" aria-hidden />
                    {sale.preview_times.trim()}
                  </span>
                ) : null}
              </div>

              <SaleCategoryChips categories={categories} />
            </header>

            <div className="lg:hidden">
              <SaleStickyActions
                action={actionProps}
                runnerLabel={runnerLabel}
                contactEmail={sale.listing_contact_email ?? null}
              />
            </div>

            <SaleFeaturedFinds items={featuredFinds} />

            {sortedPhotos.length > 0 ? (
              <section aria-labelledby="photo-gallery-heading">
                <h2
                  id="photo-gallery-heading"
                  className="mb-4 text-lg font-semibold text-foreground"
                >
                  Photo gallery
                </h2>
                <SalePhotoMasonry title={sale.title} photos={sortedPhotos} />
              </section>
            ) : null}

            {sale.description?.trim() ? (
              <section
                aria-labelledby="sale-about-heading"
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <h2
                  id="sale-about-heading"
                  className="mb-3 text-lg font-semibold text-foreground"
                >
                  About this estate sale
                </h2>
                {aboutIntro ? (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {aboutIntro}
                  </p>
                ) : null}
                <div className="prose prose-stone max-w-none prose-p:leading-relaxed dark:prose-invert">
                  <SaleDescriptionHtml html={sale.description} />
                </div>
              </section>
            ) : null}

            {hasMapPin ? (
              <details className="group rounded-2xl border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-foreground marker:content-none">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-accent" aria-hidden />
                    Map & directions
                  </span>
                  <ChevronDown
                    className="size-4 text-muted-foreground transition group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="border-t border-border px-4 pb-4 pt-2">
                  {!addressIsExact ? (
                    <p className="mb-2 text-xs text-muted-foreground">
                      Approximate area until the exact address is released.
                    </p>
                  ) : null}
                  <SaleDetailMap sale={explore} compact bare />
                </div>
              </details>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SaleStickyActions
                action={actionProps}
                runnerLabel={runnerLabel}
                contactEmail={sale.listing_contact_email ?? null}
              />
            </div>
          </aside>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
