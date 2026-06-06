"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  saleTitle: string;
  runnerLabel: string;
  contactEmail: string | null;
  className?: string;
};

/** Opens the user’s mail client with a prefilled message to the listing operator. */
export function SaleContactRunner({
  saleTitle,
  runnerLabel,
  contactEmail,
  className,
}: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  if (!contactEmail) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-5 shadow-sm",
          className,
        )}
      >
        <h3 className="text-sm font-semibold text-foreground">Questions?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Contact details for this host aren&apos;t available here yet. Check the
          listing description for how to reach {runnerLabel}.
        </p>
      </div>
    );
  }

  const buildMailto = () => {
    const body = [
      message.trim(),
      "",
      "---",
      `Re: ${saleTitle}`,
      email.trim() ? `From: ${email.trim()}` : "",
      phone.trim() ? `Phone: ${phone.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const params = new URLSearchParams({
      subject: `Question about: ${saleTitle}`,
      body,
    });
    return `mailto:${contactEmail}?${params.toString()}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-accent">
          <Mail className="size-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Questions about this sale?
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your message goes to{" "}
            <span className="font-medium text-foreground/90">{runnerLabel}</span>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="contact-email" className="sr-only">
            Your email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="sr-only">
            Your phone (optional)
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <div>
          <label htmlFor="contact-msg" className="sr-only">
            Message
          </label>
          <textarea
            id="contact-msg"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message…"
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <Button
          type="button"
          className="w-full rounded-lg"
          onClick={() => {
            window.location.href = buildMailto();
          }}
        >
          Open in email
        </Button>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Opens your email app with this message addressed to the host. Nothing is
          sent through our servers.
        </p>
      </div>
    </div>
  );
}
