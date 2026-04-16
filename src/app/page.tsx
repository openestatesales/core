import { WaitlistForm } from "@/components/WaitlistForm";

const features = [
  "Free listings, always",
  "Modern operator tools",
  "No hidden fees",
  "API access for developers",
] as const;

const competitorPain = [
  "Monthly listing fees",
  "Outdated interface",
  "No API access",
  "You're just a listing",
] as const;

const ourWins = [
  "Free to list, period",
  "Built for the future generation of estate sale platforms",
  "API access for developers",
  "No spam. Just a launch email when we go live.",
] as const;

function IconX({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

        <ul className="mt-8 flex flex-wrap gap-2">
          {features.map((label) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-lg border border-border bg-white/80 px-3 py-2 text-sm text-foreground/90 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-950/50 dark:text-zinc-300"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden
              />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3">
          <WaitlistForm />
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            No spam. Just a launch email when we go live.
          </p>
        </div>

        <div
          className="my-16 h-px w-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700"
          role="separator"
        />

        <section aria-labelledby="compare-heading">
          <p
            id="compare-heading"
            className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            Why make the switch
          </p>

          <div className="relative mt-10 grid gap-10 md:grid-cols-2 md:gap-6">
            <p
              className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(4rem,18vw,9rem)] font-normal uppercase leading-none text-zinc-300/80 select-none dark:text-zinc-800/40 md:block"
              aria-hidden
            >
              vs
            </p>

            <div className="rounded-2xl border border-border bg-white/70 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/40 md:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                EstateSales.net
              </h2>
              <ul className="mt-6 space-y-4">
                {competitorPain.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <IconX className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/[0.07] p-6 shadow-sm dark:border-accent/25 dark:bg-zinc-950/60 md:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
                Us
              </h2>
              <ul className="mt-6 space-y-4">
                {ourWins.map((item) => (
                  <li key={item} className="flex gap-3 text-foreground/90 dark:text-zinc-200">
                    <IconCheck className="mt-0.5 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
