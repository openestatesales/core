import Link from "next/link";

import { cn } from "@/lib/utils";

type ShellProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  /** `wide` for list/grid pages; `default` for forms and detail views */
  width?: "default" | "wide";
  children: React.ReactNode;
  className?: string;
};

export function DashboardPageShell({
  title,
  description,
  backHref,
  backLabel = "Dashboard",
  actions,
  width = "default",
  children,
  className,
}: ShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex-1 px-6 py-10",
        width === "wide" ? "max-w-7xl" : "max-w-4xl",
        className,
      )}
    >
      <div className="mb-10">
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            {backLabel}
          </Link>
        ) : null}

        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-4",
            backHref ? "mt-3" : undefined,
          )}
        >
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>

      {children}
    </main>
  );
}

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function DashboardSection({
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
