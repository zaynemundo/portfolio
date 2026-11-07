/**
 * The site's one public address. Cloudflare serves the site on the apex
 * domain and redirects www to it, so every canonical, sitemap and share link
 * points at the apex — otherwise search engines are sent through a redirect
 * each time.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zaynemundo.com").replace(/\/$/, "");
