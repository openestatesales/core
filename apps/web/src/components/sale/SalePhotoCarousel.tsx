"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";

import { salePhotoPublicUrl } from "@/config/sale-photos";
import type { PublicSalePhoto } from "@oes/types";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  photos: PublicSalePhoto[];
  className?: string;
};

export function SalePhotoCarousel({ title, photos, className }: Props) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const slides = sorted
    .map((photo) => ({
      photo,
      src: salePhotoPublicUrl(photo.storage_path),
    }))
    .filter((s) => Boolean(s.src));

  const [index, setIndex] = useState(0);

  const go = useCallback(
    (delta: number) => {
      if (slides.length === 0) return;
      setIndex((i) => (i + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] items-center justify-center rounded-2xl border border-stone-200 bg-amber-50/60 sm:aspect-[16/10]",
          className,
        )}
      >
        <div className="text-center text-stone-500">
          <Camera className="mx-auto mb-2 size-8 opacity-40" aria-hidden />
          <p className="text-sm">Photos coming soon</p>
        </div>
      </div>
    );
  }

  const current = slides[index]!;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="relative aspect-[4/3] bg-stone-100 sm:aspect-[16/10]">
        <Image
          key={current.photo.id}
          src={current.src}
          alt={current.photo.alt_text?.trim() || `${title} — photo ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1152px"
          priority={index === 0}
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-md backdrop-blur-sm">
          <Camera className="size-3.5 text-amber-600" aria-hidden />
          {slides.length} {slides.length === 1 ? "Photo" : "Photos"}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md transition hover:bg-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md transition hover:bg-white"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 border-t border-stone-100 bg-stone-50/80 px-3 py-2.5">
          {slides.slice(0, 12).map((slide, i) => (
            <button
              key={slide.photo.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "size-2 rounded-full transition",
                i === index ? "bg-amber-600" : "bg-stone-300 hover:bg-stone-400",
              )}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
          {slides.length > 12 ? (
            <span className="ml-1 text-[10px] text-stone-500">+{slides.length - 12}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
