"use client";

import { createDraftSale } from "@/app/operator/actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateDraftSaleButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setPending(true);
    const result = await createDraftSale();
    setPending(false);
    if (result.ok && result.data) {
      router.push(`/operator/sales/${result.data.saleId}/location`);
      router.refresh();
      return;
    }
    setError(result.ok === false ? result.message : "Something went wrong.");
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={() => void handleClick()}
        disabled={pending}
        className="bg-accent font-semibold text-zinc-950 hover:bg-accent/90"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Creating…
          </>
        ) : (
          "New draft sale"
        )}
      </Button>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
