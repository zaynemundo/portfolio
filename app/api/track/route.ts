import { createHash } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

/* Records one page view from the public site (see PageViewTracker). Nothing
 * personal is stored: the visitor id is a hash of the connection, browser and
 * day, so it can't be traced back and resets every day. */

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|vercel|monitor|curl|wget|python|axios/i;

function siteName(referrer: unknown, ownHost: string | null): string | null {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    // Moving between pages of this site isn't a referral.
    if (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0]) return null;
    return host.slice(0, 100);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT.test(userAgent)) return new Response(null, { status: 204 });

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.split(/[?#]/)[0].slice(0, 200) : "";
  if (!path.startsWith("/") || path.startsWith("/api")) return new Response(null, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT ?? process.env.DATABASE_URL ?? "";
  const visitorId = createHash("sha256").update(`${salt}|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 20);

  await prisma.pageView.create({
    data: {
      path,
      referrer: siteName(body.referrer, request.headers.get("host")),
      visitorId,
      country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) || null,
      device: /mobi|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop",
    },
  });

  return new Response(null, { status: 204 });
}
