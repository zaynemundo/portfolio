import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/app/lib/site-url";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zaira Mundo | Creative Designer & Front-End Developer",
    template: "%s | Zaira Mundo",
  },
  description:
    "Creative Designer and Front-End Developer building accessible, responsive, and high-performing websites — from interface design through to production code — across React, TypeScript, WordPress, and modern web technologies.",
  keywords: [
    "digital designer", "web designer", "front-end developer", "web developer", "UI/UX design", "digital experience",
    "React", "TypeScript", "WordPress", "accessibility", "technical SEO", "Dubai", "UAE",
  ],
  authors: [{ name: "Zaira Mundo" }],
  creator: "Zaira Mundo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Zaira Mundo",
    title: "Zaira Mundo | Creative Designer & Front-End Developer",
    description:
      "Creative Designer and Front-End Developer building accessible, responsive, and high-performing websites — from interface design through to production code — across React, TypeScript, WordPress, and modern web technologies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zaira Mundo | Creative Designer & Front-End Developer",
    description: "Creative Designer and Front-End Developer.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
