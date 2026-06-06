import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Open Estate Sales is free to use for operators and shoppers.",
};

const included = [
  "Unlimited listings",
  "Up to 200 photos per sale",
  "Public listing pages",
  "Search visibility",
  "60-day listing retention",
];

const faqs = [
  {
    question: "Will listings always be free?",
    answer:
      "Our goal is to keep estate sale listings free for operators.",
  },
  {
    question: "Do I need a credit card?",
    answer: "No.",
  },
  {
    question: "Is the software open source?",
    answer: "Yes. The platform is released under the AGPL license.",
  },
];

export default function PricingPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-12 px-4 py-14 sm:px-6 md:py-20">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Pricing
        </h1>
        <p className="max-w-2xl leading-8 text-muted-foreground">
          Open Estate Sales is free to use. Create an account, publish estate sales,
          upload photos, and manage listings at no cost.
        </p>
      </header>

      <section
        aria-labelledby="tier-free-heading"
        className="rounded-xl border border-border bg-card p-6 sm:p-8"
      >
        <h2
          id="tier-free-heading"
          className="border-b border-border pb-4 text-lg font-semibold text-foreground"
        >
          Free
        </h2>

        <p className="mt-6 text-3xl font-semibold tabular-nums text-foreground">
          $0
          <span className="text-base font-normal text-muted-foreground">/month</span>
        </p>

        <p className="mt-6 text-sm font-medium text-foreground">Included</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <Link
          href="/login"
          className={cn(buttonVariants({ size: "default" }), "mt-8")}
        >
          Create account
        </Link>
      </section>

      <section aria-labelledby="faq-heading" className="space-y-6">
        <h2
          id="faq-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Frequently asked questions
        </h2>
        <dl className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-medium text-foreground">{faq.question}</dt>
              <dd className="mt-1 leading-8 text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-2 border-t border-border pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Questions?
        </h2>
        <p className="leading-8 text-muted-foreground">
          Contact us if you have questions about using Open Estate Sales for your
          business.
        </p>
      </section>
    </article>
  );
}
