import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Open Estate Sales helps people discover estate sales and helps operators publish them online.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6 md:py-20">
      <header className="space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Open Estate Sales
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Open Estate Sales helps people discover estate sales and helps operators publish
          them online.
        </p>
      </header>

      <section className="space-y-4">
        <p className="leading-8 text-muted-foreground">
          The project started from a simple observation: estate sales are local community
          events, but the tools used to publish and find them are often fragmented, expensive,
          or difficult to manage.
        </p>
        <p className="leading-8 text-muted-foreground">
          Our goal is to make estate sale listings easier to create, easier to share, and
          easier to discover.
        </p>
        <p className="leading-8 text-muted-foreground">
          Whether you&apos;re running a professional estate sale company, organizing a family
          sale, or simply looking for interesting things nearby, Open Estate Sales provides a
          straightforward way to connect buyers and sellers.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          For shoppers
        </h2>
        <p className="leading-8 text-muted-foreground">
          Browse upcoming sales, view photos, see sale details, and discover events happening
          in your area.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          For operators
        </h2>
        <p className="leading-8 text-muted-foreground">
          Create listings, publish photos, manage sale information, and reach local buyers
          without worrying about listing fees or complicated publishing workflows.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Open source
        </h2>
        <p className="leading-8 text-muted-foreground">
          Open Estate Sales is open source software released under the AGPL license. We believe
          transparency creates better software and gives operators confidence in the tools they
          use.{" "}
          <Link
            href="https://github.com/openestatesales/core"
            className="text-foreground underline underline-offset-4 hover:text-accent"
          >
            View the source on GitHub
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Our approach
        </h2>
        <p className="leading-8 text-muted-foreground">
          We focus on building useful tools for the estate sale community:
        </p>
        <ul className="list-disc space-y-2 pl-5 leading-8 text-muted-foreground">
          <li>Clear, searchable listings</li>
          <li>Mobile-friendly browsing</li>
          <li>Easy publishing workflows</li>
          <li>Reliable location and schedule information</li>
          <li>Open access to public sale information</li>
        </ul>
        <p className="leading-8 text-muted-foreground">
          We&apos;re a small project with a simple goal: make estate sales easier to find and
          easier to manage.
        </p>
      </section>
    </article>
  );
}
