import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

/** Redirects to /login if there's no valid session. Use at the top of dashboard pages and actions. */
export async function requireSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("admin_session")?.value;

  const session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } })
    : null;

  if (!session || session.expiresAt < new Date()) {
    redirect("/login");
  }

  return session;
}
