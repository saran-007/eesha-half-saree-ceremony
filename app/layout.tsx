import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eesha.info";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Eesha Half Saree Ceremony | March 29, 2026",
  description:
    "You're invited to celebrate Eesha's Half Saree Ceremony on Sunday, March 29th 2026 at Celebrations Event Center, Leander, TX.",
  openGraph: {
    title: "Eesha Half Saree Ceremony",
    description:
      "Join us to celebrate Eesha's Half Saree Ceremony on Sunday, March 29th 2026.",
    type: "website",
    url: siteUrl,
    siteName: "Eesha Half Saree Ceremony",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Eesha Half Saree Ceremony",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesha Half Saree Ceremony",
    description:
      "Join us to celebrate Eesha's Half Saree Ceremony on Sunday, March 29th 2026.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow" />
      </head>
      <body
        className={`${cormorant.variable} ${outfit.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
