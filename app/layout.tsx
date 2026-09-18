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
    default: "Zaira Mundo | Digital Designer & Developer",
    template: "%s | Zaira Mundo",
  },
  description:
    "Digital Designer and Developer building accessible, responsive, and high-performing websites — from interface design through to production code — across React, TypeScript, WordPress, and modern web technologies.",
  keywords: [
    "digital designer", "web designer", "front-end developer", "web developer", "UI/UX design", "digital experience",
    "React", "TypeScript", "WordPress", "accessibility", "technical SEO", "Dubai", "UAE",
  ],
  authors: [{ name: "Zaira Mundo" }],
  creator: "Zaira Mundo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zaira Mundo",
    title: "Zaira Mundo | Digital Designer & Developer",
    description:
      "Digital Designer and Developer building accessible, responsive, and high-performing websites — from interface design through to production code — across React, TypeScript, WordPress, and modern web technologies.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zaira Mundo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zaira Mundo | Digital Designer & Developer",
    description: "Digital Designer and Developer.",
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
