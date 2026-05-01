import { SiteChrome } from "@/components/SiteChrome";

export default function SdksLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome active="sdks">{children}</SiteChrome>;
}

