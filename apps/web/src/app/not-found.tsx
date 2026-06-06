import Link from "next/link";
import { MapPinOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
        <MapPinOff className="size-7" aria-hidden />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        The sale you&apos;re looking for isn&apos;t here — it may have ended, moved, or
        never been listed on Open Estate Sales. Happens at every estate sale: someone
        already grabbed the good stuff.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/sales"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-accent px-8 font-semibold text-white hover:bg-accent/90",
          )}
        >
          Browse sales
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back to map
        </Link>
      </div>
    </main>
  );
}
