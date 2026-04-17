import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-14 md:px-6 md:py-20 lg:max-w-4xl">
        <p className="mb-6 inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-950">
          Free. Forever. Actually.
        </p>

        <h1 className="font-display text-5xl leading-[0.95] font-normal uppercase tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl md:text-7xl lg:text-8xl">
          Estate Sales,
          <br />
          <span className="text-accent">Unchained.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          The{" "}
          <strong className="font-semibold text-foreground">
            free, modern alternative
          </strong>{" "}
          to EstateSales.net — built for operators who are tired of paying to list
          their own inventory.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <WaitlistForm />
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            No spam. Just a launch email when we go live.
          </p>
        </div>

        <div className="mt-14 space-y-8">
          <div className="rounded-xl border border-dashed border-zinc-400/60 bg-zinc-500/[0.06] px-4 py-4 dark:border-zinc-600 dark:bg-zinc-950/50">
            <p className="text-sm leading-relaxed text-foreground/90 dark:text-zinc-200">
              <span className="mr-1.5" aria-hidden>
                🚧
              </span>
              <strong className="font-semibold">We&apos;re building this in public.</strong>{" "}
              Poke around — things will break, data is demo, and we ship fast. That&apos;s
              the point.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Pick a path
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/sales"
                className="group flex flex-col justify-between rounded-2xl border border-border bg-white/80 p-6 shadow-sm transition hover:border-accent/50 hover:bg-accent/[0.04] dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:bg-zinc-950/80"
              >
                <div>
                  <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                    Shoppers
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Explore listings and the map — rough around the edges, real progress.
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Browse sales
                  <ArrowRight
                    className="size-4 transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>

              <Link
                href="/operator"
                className="group flex flex-col justify-between rounded-2xl border border-accent/35 bg-accent/[0.08] p-6 shadow-sm transition hover:border-accent/55 hover:bg-accent/[0.12] dark:border-accent/25 dark:bg-zinc-950/60 dark:hover:bg-zinc-950/80"
              >
                <div>
                  <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                    Operators
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    List estate sales free — create an account to get started.
                  </p>
                </div>
                <span className="mt-6 flex flex-col items-start gap-0.5">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    List your sales free
                    <ArrowRight
                      className="size-4 text-accent transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">Sign up</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
