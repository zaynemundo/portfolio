import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PROTECTED_TOP_LEVEL_PATHS } from "@/app/(admin)/_routes";

function isProtected(pathname: string): boolean {
  return PROTECTED_TOP_LEVEL_PATHS.some((base) => pathname === base || pathname.startsWith(base + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const sessionId = request.cookies.get("admin_session")?.value;
  const session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId } })
    : null;

  if (!session || session.expiresAt < new Date()) {
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
    "/notes/:path*",
    "/freelance/:path*",
    "/clients/:path*",
    "/finance/:path*",
    "/invoices/:path*",
  ],
};
