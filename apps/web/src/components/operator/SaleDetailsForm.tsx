"use client";

import { updateSaleListingCopy } from "@/apis/data/sales-client";
import type { OperatorSaleWizard } from "@/app/dashboard/actions";
import { SaleDescriptionEditor } from "@/components/operator/SaleDescriptionEditor";
import {
  CharCountHint,
  SectionCard,
} from "@/components/operator/OperatorWizardSection";
import { OperatorSaleWizardShell } from "@/components/operator/OperatorSaleWizardShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { saleStepCopySchema } from "@/form-schemas/sale";
import { plainTextFromHtml } from "@/utils/html";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, FileText, Loader2, ScrollText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  saleId: string;
  initial: OperatorSaleWizard;
};

export default function SaleDetailsForm({ saleId, initial }: Props) {
  const router = useRouter();
  const [termsHtml, setTermsHtml] = useState(initial.terms_html ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    initial.description ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const termsCount = plainTextFromHtml(termsHtml).length;
  const descriptionCount = plainTextFromHtml(descriptionHtml).length;

  const mutation = useMutation({
    mutationFn: updateSaleListingCopy,
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push(`/dashboard/sales/${saleId}/dates`);
      router.refresh();
    },
    onError: () => {
      setError("Something went wrong. Try again.");
    },
  });

  const handleNext = () => {
    const parsed = saleStepCopySchema.safeParse({
      termsHtml: termsHtml.trim() ? termsHtml : null,
      descriptionHtml: descriptionHtml.trim() ? descriptionHtml : null,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    setError(null);
    mutation.mutate({
      saleId,
      termsHtml: parsed.data.termsHtml,
      descriptionHtml: parsed.data.descriptionHtml,
    });
  };

  return (
    <OperatorSaleWizardShell
      saleId={saleId}
      draftTitle={initial.title}
      heading="Listing copy"
      description="Terms shoppers must agree to, plus a full description of what you're selling."
    >
      <div className="mx-auto mt-6 w-full max-w-2xl">
        {error ? (
          <div
            className="mb-5 flex gap-2.5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <SectionCard
            icon={<ScrollText className="h-5 w-5" />}
            title="Terms & conditions"
            description="Payment rules, liability, returns, and anything shoppers must agree to before attending."
          >
            <SaleDescriptionEditor
              editorKey={`${saleId}-terms`}
              initialHtml={initial.terms_html ?? ""}
              placeholder="Cash and cards accepted. All sales final. Not responsible for accidents on premises…"
              onChange={setTermsHtml}
              minHeight={180}
            />
            <CharCountHint count={termsCount} minimum={10} />
          </SectionCard>

          <SectionCard
            icon={<FileText className="h-5 w-5" />}
            title="Sale description"
            description="Tell buyers what's inside, how pricing works, and what makes this sale worth the trip."
          >
            <SaleDescriptionEditor
              editorKey={`${saleId}-description`}
              initialHtml={initial.description ?? ""}
              placeholder="Mid-century furniture, vintage tools, designer kitchenware, records, and more…"
              onChange={setDescriptionHtml}
              minHeight={280}
            />
            <CharCountHint count={descriptionCount} minimum={20} />
          </SectionCard>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Link
            href={`/dashboard/sales/${saleId}/location`}
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
            <Button
              type="button"
              onClick={() => void handleNext()}
              disabled={mutation.isPending}
              className="h-11 bg-accent px-8 text-sm font-semibold text-white hover:bg-accent/90"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Next →"
              )}
            </Button>
          </div>
        </div>
      </div>
    </OperatorSaleWizardShell>
  );
}
