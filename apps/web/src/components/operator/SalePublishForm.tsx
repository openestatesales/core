"use client";

import {
  publishSale,
  publishedSaleHref,
} from "@/apis/data/sales-client";
import type { OperatorSaleWizard } from "@/app/dashboard/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { OperatorSaleWizardShell } from "@/components/operator/OperatorSaleWizardShell";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  saleId: string;
  initial: OperatorSaleWizard;
};

export default function SalePublishForm({ saleId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => publishSale(saleId),
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.data) {
        router.push(publishedSaleHref(result.data.regionSlug, result.data.listingSlug));
        router.refresh();
      }
    },
    onError: () => {
      setError("Something went wrong. Try again.");
    },
  });

  const isPublished = initial.status === "published";

  return (
    <OperatorSaleWizardShell
      saleId={saleId}
      draftTitle={initial.title}
      heading="Publish"
      description="Make this sale visible on the public map and listing pages."
    >
      <div className="mt-8 w-full space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              isPublished
                ? "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300"
                : "bg-red-600/15 text-red-800 dark:text-red-300",
            )}
          >
            {isPublished ? "Published" : "Unpublished"}
          </span>
        </div>

        {error ? (
          <div
            className="flex gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">
          Publishing requires basics &amp; location, listing copy (terms + description), and at
          least one scheduled sale day. Use a real sale name (not &quot;Untitled sale&quot;).
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            href={`/dashboard/sales/${saleId}/pictures`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Back
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "ghost", size: "default" })}
            >
              Cancel
            </Link>
            {isPublished ? (
              <Link
                href={publishedSaleHref(initial.region_slug, initial.listing_slug)}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "bg-accent font-semibold text-white hover:bg-accent/90",
                )}
              >
                View listing
              </Link>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setError(null);
                  mutation.mutate();
                }}
                disabled={mutation.isPending}
                className="bg-accent font-semibold text-white hover:bg-accent/90"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Publishing…
                  </>
                ) : (
                  "Publish sale"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </OperatorSaleWizardShell>
  );
}
