/**
 * The site's one public address. Vercel serves the site on www and redirects
 * the bare domain to it, so every canonical, sitemap and share link points at
 * www — otherwise search engines are sent through a redirect each time.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.zairamundo.com").replace(/\/$/, "");
