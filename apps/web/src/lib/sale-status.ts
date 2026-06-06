export type SaleStatus = "draft" | "published" | "ended";

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPastEndDate(endDate: string): boolean {
  if (!endDate) return false;
  return endDate < todayIsoDate();
}

/** Effective status for UI — published + past end_date reads as ended. */
export function resolveSaleStatus(status: string, endDate: string): SaleStatus {
  if (status === "published" && isPastEndDate(endDate)) return "ended";
  if (status === "draft" || status === "published" || status === "ended") {
    return status;
  }
  return "draft";
}

export function isSaleEditable(status: string, endDate: string): boolean {
  return resolveSaleStatus(status, endDate) === "draft";
}

export function saleStatusLabel(status: string, endDate: string): string {
  switch (resolveSaleStatus(status, endDate)) {
    case "published":
      return "Live";
    case "draft":
      return "Draft";
    case "ended":
      return "Ended";
    default:
      return status;
  }
}

export function saleStatusStyle(status: string, endDate: string): string {
  switch (resolveSaleStatus(status, endDate)) {
    case "published":
      return "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200";
    case "draft":
      return "bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:text-amber-100";
    case "ended":
      return "bg-zinc-500/15 text-zinc-700 ring-zinc-500/20 dark:text-zinc-300";
    default:
      return "bg-muted text-muted-foreground ring-border";
  }
}
