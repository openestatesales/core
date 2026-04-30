"use client";

import type { ReactNode } from "react";

type EmptySalesProps = {
  title?: string;
  subtitle?: string;
  showTips?: boolean;
  extraActions?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function EmptySales({
  title = "No sales yet",
  subtitle =
    "There aren’t any estate sales listed in this area right now. Check back soon or invite a local company to list.",
  showTips = true,
  extraActions,
  footer,
  className = "",
}: EmptySalesProps) {
  return (
    <div className={`mx-auto max-w-4xl text-center ${className}`}>
      <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
        {subtitle}
      </p>

      {showTips ? (
        <div className="mx-auto mb-10 max-w-2xl space-y-1 text-sm text-muted-foreground">
          <p>Follow companies to see new sales first.</p>
          <p>Save your area for updates.</p>
          <p>Invite a company to list.</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {extraActions}
        {footer ?? (
          <p className="text-xs text-muted-foreground sm:text-sm">
            Updated as new sales are published
          </p>
        )}
      </div>
    </div>
  );
}
