import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import { SITE_URL } from "@/app/lib/site-url";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/app/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Editorial serif — the display voice of the redesign. Self-hosted so the
   build never depends on Google Fonts being reachable. */
const instrumentSerif = localFont({
  src: [
    { path: "./fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});

/* Mono — micro-labels, numbers, metadata. */
const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

/* Runs before paint: switches on the scroll-reveal styles (progressive
   enhancement — without JS every .site-reveal element stays visible). The
   theme itself is rendered from the cookie on the server, so there is no
   flash and no hydration mismatch. */
const THEME_INIT = `(function(){try{document.documentElement.classList.add('js-site-reveal-ready')}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Zayne Mundo",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "graphic designer", "web developer", "visual designer", "graphic design UAE", "web developer Dubai",
    "brand identity", "2D illustration", "mockups", "WordPress", "HTML5", "CSS3", "JavaScript",
    "social media design", "SEO", "digital marketing", "Dubai", "UAE",
  ],
  authors: [{ name: "Zayne Mundo" }],
  creator: "Zayne Mundo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Zayne Mundo",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Plain inline script: runs while the body is parsed, before first
            paint, so the saved theme never flashes. Kept out of next/script
            because a beforeInteractive child caused a hydration mismatch. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
      </body>
    </html>
  );
}
