import { WaitlistForm } from "@/components/WaitlistForm";

/**
 * Secondary CTA — not the hero. Shoppers land on listings/map first.
 */
export function HomeWaitlistStrip() {
  return (
    <section className="border-t border-dashed border-border/80 bg-muted/25 px-4 py-8 dark:bg-zinc-950/35 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-4 text-sm font-medium text-foreground">
          We are going into beta soon in select areas. Get a single email when we launch near you.
        </p>
        <WaitlistForm />
      </div>
    </section>
  );
}
