import type { Metadata } from "next";
import { Anton, Inter, Geist } from "next/font/google";
import "./globals.css";
import { DevelopmentStageBanner } from "@/components/DevelopmentStageBanner";
import { Footer } from "@/components/FooterBar";
import { NavBarGate } from "@/components/NavBarGate";
import { PersonaProvider } from "@/components/persona/PersonaProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Open Estate Sales — browse & list free",
    template: "%s — Open Estate Sales",
  },
  description:
    "Find local estate sales on the map or list your own — free for shoppers and operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "scroll-smooth",
        "antialiased",
        inter.variable,
        anton.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="font-sans relative min-h-full bg-background text-foreground">
        <ThemeProvider>
          <PersonaProvider>
            <div
              className="grain opacity-[0.02] dark:opacity-[0.18]"
              aria-hidden
            />
            <div className="relative z-10 flex min-h-screen flex-col">
              <DevelopmentStageBanner />
              <NavBarGate />
              <div className="flex flex-1 flex-col">{children}</div>
              <Footer />
            </div>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
