"use client";

import { SaleCreationStepper } from "@/components/operator/SaleCreationStepper";
import { DeleteSaleButton } from "@/components/operator/DeleteSaleButton";
import { saleCreationSteps } from "@/utils/sale-creation-steps";

type Props = {
  saleId: string;
  draftTitle: string;
  heading: string;
  description?: string;
  children: React.ReactNode;
};

export function OperatorSaleWizardShell({
  saleId,
  draftTitle,
  heading,
  description,
  children,
}: Props) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <SaleCreationStepper steps={[...saleCreationSteps(saleId)]} />
      <div className="mb-10 mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">Draft · {draftTitle}</p>
          <DeleteSaleButton saleId={saleId} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {heading}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </main>
  );
}
