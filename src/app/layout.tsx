import type { Metadata } from "next";
import { Anton, Inter, Geist } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/FooterBar";
import { NavBar } from "@/components/NavBar";
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
  title: "Estate Sales, Unchained — Coming Soon",
  description:
    "The free, modern alternative to EstateSales.net — built for operators who are tired of paying to list their own inventory.",
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
          <div
            className="grain opacity-[0.08] dark:opacity-[0.22]"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-screen flex-col">
            <NavBar />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
