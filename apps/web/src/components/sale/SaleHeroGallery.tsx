import Image from "next/image";

import { salePhotoPublicUrl } from "@/config/sale-photos";
import type { PublicSalePhoto } from "@oes/types";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  photos: PublicSalePhoto[];
  className?: string;
};

/**
 * Listing hero imagery — large lead photo plus up to four thumbnails on desktop.
 */
export function SaleHeroGallery({ title, photos, className }: Props) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  if (sorted.length === 0) return null;

  const hero = sorted[0]!;
  const rest = sorted.slice(1);
  const heroSrc = salePhotoPublicUrl(hero.storage_path);
  if (!heroSrc) return null;

  return (
    <div
      className={cn(
        "grid gap-0.5 sm:gap-1",
        rest.length > 0 ? "lg:grid-cols-[1.35fr_1fr]" : "grid-cols-1",
        className,
      )}
    >
      <div className="relative aspect-[16/10] min-h-[240px] overflow-hidden sm:min-h-[320px] lg:min-h-[480px]">
        <Image
          src={heroSrc}
          alt={hero.alt_text?.trim() || `${title} — listing photo`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 70vw"
          priority
        />
      </div>

      {rest.length > 0 ? (
        <div className="hidden grid-cols-2 gap-0.5 sm:gap-1 lg:grid">
          {rest.slice(0, 4).map((photo, i) => {
            const src = salePhotoPublicUrl(photo.storage_path);
            if (!src) return null;
            return (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden"
              >
                <Image
                  src={src}
                  alt={photo.alt_text?.trim() || `${title} — photo ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 18vw"
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="flex gap-1 overflow-x-auto px-1 pb-1 lg:hidden">
          {rest.slice(0, 4).map((photo, i) => {
            const src = salePhotoPublicUrl(photo.storage_path);
            if (!src) return null;
            return (
              <div
                key={photo.id}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={src}
                  alt={photo.alt_text?.trim() || `${title} — photo ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
