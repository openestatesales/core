import Image from "next/image";

import { salePhotoPublicUrl } from "@/config/sale-photos";
import type { PublicSalePhoto } from "@oes/types";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  photos: PublicSalePhoto[];
  className?: string;
};

/** Pinterest-style columns layout for estate sale photos. */
export function SalePhotoMasonry({ title, photos, className }: Props) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const items = sorted
    .map((photo, i) => ({
      photo,
      src: salePhotoPublicUrl(photo.storage_path),
      index: i,
      tall: i % 5 === 0,
    }))
    .filter((item) => Boolean(item.src));

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-3",
        className,
      )}
    >
      {items.map(({ photo, src, index, tall }) => (
        <div
          key={photo.id}
          className={cn(
            "mb-3 break-inside-avoid overflow-hidden rounded-xl border border-stone-200 bg-stone-100 sm:mb-4",
            tall ? "aspect-[3/4]" : "aspect-[4/3]",
          )}
        >
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={photo.alt_text?.trim() || `${title} — photo ${index + 1}`}
              fill
              className="object-cover transition duration-300 hover:scale-[1.02]"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 320px"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
