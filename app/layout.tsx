import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zairamundo.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zaira Mundo | Front-End Developer & Digital Experience Specialist",
    template: "%s | Zaira Mundo",
  },
  description:
    "Front-End Developer and Digital Experience Specialist building accessible, responsive, and high-performing websites across React, TypeScript, WordPress, and modern web technologies.",
  keywords: [
    "front-end developer", "web developer", "digital experience",
    "React", "TypeScript", "WordPress", "accessibility", "technical SEO", "Dubai", "UAE",
  ],
  authors: [{ name: "Zaira Mundo" }],
  creator: "Zaira Mundo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zaira Mundo",
    title: "Zaira Mundo | Front-End Developer & Digital Experience Specialist",
    description:
      "Front-End Developer and Digital Experience Specialist building accessible, responsive, and high-performing websites across React, TypeScript, WordPress, and modern web technologies.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zaira Mundo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zaira Mundo | Front-End Developer & Digital Experience Specialist",
    description: "Front-End Developer and Digital Experience Specialist.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
