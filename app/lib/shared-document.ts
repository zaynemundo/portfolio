import { prisma } from "@/app/lib/prisma";

/** The document behind a share link, or null if it was never shared, was made private again, or has expired. */
export async function getSharedDocument(token: string) {
  if (!token) return null;
  const doc = await prisma.document.findUnique({
    where: { shareToken: token },
    select: { id: true, name: true, fileUrl: true, shareExpiresAt: true, client: { select: { name: true } } },
  });
  if (!doc) return null;
  if (doc.shareExpiresAt && doc.shareExpiresAt < new Date()) return null;
  return doc;
}

/** Notes that the share link's page was opened, for the "opened 3 times" line in the admin. */
export async function recordSharedDocumentOpened(id: string) {
  await prisma.document
    .update({ where: { id }, data: { shareOpenCount: { increment: 1 }, shareLastOpenedAt: new Date() } })
    // The log is a nicety; the client still gets their document if it can't be written.
    .catch(() => {});
}

/**
 * The line printed across a shared document: who it was shared with and when
 * it was opened, so a copy that gets passed on points back to its link.
 */
export function watermarkText(clientName: string | null | undefined, now = new Date()): string {
  const day = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return clientName ? `Shared with ${clientName} · ${day}` : `Confidential · ${day}`;
}
