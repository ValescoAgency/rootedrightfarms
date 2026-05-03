import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";
import { getSiteUrl } from "@/lib/site-url";

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Rooted Right Farms — Premium Indoor Cannabis, Ardmore OK",
    template: "%s | Rooted Right Farms",
  },
  description:
    "Premium indoor hydroponic cannabis cultivation in Ardmore, Oklahoma. B2B wholesale for licensed dispensaries.",
  applicationName: "Rooted Right Farms",
  authors: [{ name: "Rooted Right Farms" }],
  keywords: [
    "cannabis",
    "Oklahoma dispensary",
    "indoor hydroponic",
    "wholesale cannabis",
    "Ardmore Oklahoma",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Rooted Right Farms",
    title: "Rooted Right Farms — Premium Indoor Cannabis, Ardmore OK",
    description:
      "Premium indoor hydroponic cannabis cultivation in Ardmore, Oklahoma. B2B wholesale for licensed dispensaries.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rooted Right Farms — Premium Indoor Cannabis, Ardmore OK",
    description:
      "Premium indoor hydroponic cannabis cultivation in Ardmore, Oklahoma.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
