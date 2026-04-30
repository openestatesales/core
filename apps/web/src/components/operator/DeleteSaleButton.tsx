"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { deleteSale } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteSaleButton({ saleId }: { saleId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Trash2 className="mr-2 size-4" aria-hidden />
        Delete
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Delete sale confirmation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" aria-hidden />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl dark:border-zinc-800">
            <h3 className="text-base font-semibold text-foreground">Delete sale?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently deletes the sale and its data. This can’t be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                ref={cancelRef}
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const res = await deleteSale(saleId);
                    if (!res.ok) {
                      setError(res.message);
                      setOpen(false);
                      return;
                    }
                    setOpen(false);
                    router.push("/dashboard");
                    router.refresh();
                  });
                }}
              >
                Delete sale
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

