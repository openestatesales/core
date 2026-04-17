import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { FooterNewsletter } from "@/components/FooterNewsletter";
import { GithubIcon } from "@/components/icons/Github";
import { DiscordIcon, FacebookIcon, XIcon } from "@/components/icons/Social";
import { SiteLogo } from "@/components/icons/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/msabree/open-estate-sales";
const DEV_PORTAL_PROD = "https://developer.openestatesales.com";

function developerPortalUrl() {
  if (process.env.NODE_ENV === "development") return "http://localhost:3001";
  return DEV_PORTAL_PROD;
}

type FooterProps = {
  className?: string;
};

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-accent";
  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(className, "inline-flex items-center gap-1")}
        >
          {children}
          <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className={className}>
        {children}
      </Link>
    </li>
  );
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto border-t border-border bg-muted/30 dark:bg-zinc-950/40",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-16 xl:gap-20">
          <div className="space-y-8">
            <SiteLogo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Free estate sale listings — open source, AGPL-3.0.
            </p>

            <div>
              <p className="sr-only">Social</p>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground opacity-50"
                  title="Coming soon"
                >
                  <XIcon className="size-5" />
                </span>
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground opacity-50"
                  title="Coming soon"
                >
                  <DiscordIcon className="size-5" />
                </span>
                <a
                  href={REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                  aria-label="GitHub repository"
                >
                  <GithubIcon className="size-5" />
                </a>
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground opacity-50"
                  title="Coming soon"
                >
                  <FacebookIcon className="size-5" />
                </span>
              </div>
            </div>

            <FooterNewsletter />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            <Column title="Product">
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/sales">Browse sales</FooterLink>
            </Column>
            <Column title="Company">
              <FooterLink href="/company">Company</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
            </Column>
            <Column title="Legal">
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
            </Column>
            <Column title="Developers">
              <FooterLink href={developerPortalUrl()} external>
                Developer Hub
              </FooterLink>
              <FooterLink href={REPO} external>
                GitHub
              </FooterLink>
            </Column>
            <Column title="Community">
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/status">Status</FooterLink>
            </Column>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            © {year} Open Estate Sales ·{" "}
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-accent hover:underline"
            >
              AGPL-3.0
            </a>
            {" · "}
            <Link
              href="https://openestatesales.com"
              className="underline-offset-2 hover:text-accent hover:underline"
            >
              openestatesales.com
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
