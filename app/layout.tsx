import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/app/lib/site-url";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/app/lib/seo";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Zaira Mundo",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "web designer", "web developer", "UI/UX designer", "front-end developer", "web design UAE", "web developer Dubai",
    "React", "TypeScript", "WordPress", "accessibility", "technical SEO", "Dubai", "UAE",
  ],
  authors: [{ name: "Zaira Mundo" }],
  creator: "Zaira Mundo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Zaira Mundo",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
