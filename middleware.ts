import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  // Always allow login page
  if (pathname === "/admin/login") return NextResponse.next();

  const session = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SECRET;

  if (!session || !secret || session !== secret) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
