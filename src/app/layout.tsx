import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/nav/top-nav";
import { FloatingPillNav } from "@/components/nav/floating-pill-nav";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rooted Right Farms — Premium Indoor Cannabis, Ardmore OK",
    template: "%s | Rooted Right Farms",
  },
  description:
    "Premium indoor hydroponic cannabis cultivation in Ardmore, Oklahoma. B2B wholesale for licensed dispensaries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TopNav />
        <main id="main">{children}</main>
        <Footer />
        <FloatingPillNav />
      </body>
    </html>
  );
}
