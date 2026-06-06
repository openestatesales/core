import { cn } from "@/lib/utils";

export function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

      <div className="p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-tight text-foreground">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {children}
    </label>
  );
}

export function CharCountHint({
  count,
  minimum,
  className,
}: {
  count: number;
  minimum: number;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Minimum {minimum} characters ({count} now).
    </p>
  );
}
