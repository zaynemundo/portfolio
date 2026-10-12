import { prisma } from "@/app/lib/prisma";

/** The document behind a share link, or null if it was never shared, was made private again, or has expired. */
export async function getSharedDocument(token: string) {
  if (!token) return null;
  const doc = await prisma.document.findUnique({
    where: { shareToken: token },
    select: { name: true, fileUrl: true, shareExpiresAt: true },
  });
  if (!doc) return null;
  if (doc.shareExpiresAt && doc.shareExpiresAt < new Date()) return null;
  return doc;
}
