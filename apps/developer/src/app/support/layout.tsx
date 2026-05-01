import { SiteChrome } from "@/components/SiteChrome";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome active="support">{children}</SiteChrome>;
}

