import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_TOP_LEVEL_PATHS } from "@/app/(admin)/_routes";

function isProtected(pathname: string): boolean {
  return PROTECTED_TOP_LEVEL_PATHS.some((base) => pathname === base || pathname.startsWith(base + "/"));
}

function isPublicAsset(pathname: string): boolean {
  return /\.(mp4|webm|jpe?g|png|webp|avif|gif|svg)$/i.test(pathname);
}

/**
 * Cheap cookie-presence gate only — no DB query here. Middleware runs at the
 * edge, geographically close to the visitor but far from the Neon database,
 * so a session lookup here was adding a very long round-trip to every single
 * navigation (on top of the same lookup already happening, cached, in
 * app/(admin)/layout.tsx via requireSession()). requireSession() remains the
 * real authority: it validates the session against the DB and redirects to
 * /login itself if the cookie is missing, invalid, or expired. This is only
 * a fast first filter to keep fully unauthenticated requests from rendering
 * anything at all.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // public/case-studies/* (project videos + posters) shares its URL prefix
  // with the /case-studies admin route — let those static files through, or
  // logged-out visitors get redirected to /login instead of the media.
  if (!isProtected(pathname) || isPublicAsset(pathname)) return NextResponse.next();

  const sessionId = request.cookies.get("admin_session")?.value;

  if (!sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Next.js statically parses `matcher` at build time, so it must be a literal
// array — it can't be computed from PROTECTED_TOP_LEVEL_PATHS at runtime.
// Keep this in sync with routes.ts; isProtected() above is what actually
// gates access and is the safety net if this list ever drifts.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/account/:path*",
    "/cv/:path*",
    "/work-settings/:path*",
    "/insights-settings/:path*",
    "/inquiries/:path*",
    "/homepage/:path*",
    "/write-ups/:path*",
    "/case-studies/:path*",
    "/freelance/:path*",
    "/clients/:path*",
    "/contacts/:path*",
    "/documents/:path*",
    "/finance/:path*",
    "/invoices/:path*",
  ],
};
