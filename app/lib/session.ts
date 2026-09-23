import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

/**
 * Cached by session id so the admin layout's auth check doesn't hit Neon on
 * every navigation. Expiry is still checked fresh against `new Date()` outside
 * the cache below, so a naturally-expired session is never treated as valid.
 * Revocation (logout, password change/reset) invalidates immediately via
 * updateTag(CACHE_TAGS.sessions) in app/actions/auth.ts — the `revalidate`
 * window here is only a safety net for the 7-day natural-expiry edge.
 */
const getSessionById = unstable_cache(
  (sessionId: string) => prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } }),
  ["session-lookup"],
  { tags: [CACHE_TAGS.sessions], revalidate: 300 }
);

/** Redirects to /login if there's no valid session. Use at the top of dashboard pages and actions. */
export async function requireSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("admin_session")?.value;

  const cached = sessionId ? await getSessionById(sessionId) : null;
  // unstable_cache round-trips through JSON, so expiresAt comes back as a
  // string, not a Date — reconstruct it before comparing/returning.
  const session = cached ? { ...cached, expiresAt: new Date(cached.expiresAt) } : null;

  if (!session || session.expiresAt < new Date()) {
    redirect("/login");
  }

  return session;
}
