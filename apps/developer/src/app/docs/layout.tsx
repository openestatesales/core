import { SiteChrome } from "@/components/SiteChrome";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome active="docs">{children}</SiteChrome>;
}

