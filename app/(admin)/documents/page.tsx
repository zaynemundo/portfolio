import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { ClientDocuments } from "@/app/(admin)/_components/DocumentList";

/* Every document in one table. Each row says which client (and job, if any)
 * it is under; the Filters menu narrows the table to one client. A document's
 * job is optional, so it's chosen when adding it or under Edit in its preview. */

const getDocumentsByClient = unstable_cache(
  () =>
    Promise.all([
      prisma.client.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          projects: { orderBy: { updatedAt: "desc" }, select: { id: true, name: true } },
          documents: { orderBy: { createdAt: "desc" } },
        },
      }),
      // Uploaded on a job that has no client yet, so there is no client list to file them under.
      prisma.document.findMany({
        where: { clientId: null },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { id: true, name: true } } },
      }),
    ]),
  ["documents-by-client"],
  { tags: [CACHE_TAGS.documents, CACHE_TAGS.clients, CACHE_TAGS.freelance], revalidate: 60 }
);

// unstable_cache round-trips through JSON, so Date fields come back as strings.
function addedLabel(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DocumentsPage() {
  const [clients, unfiled] = await getDocumentsByClient();

  const documents = [
    ...clients.flatMap((c) => c.documents.map((d) => ({ ...d, projectName: null as string | null }))),
    ...unfiled.map((d) => ({ ...d, projectName: d.project?.name ?? null })),
  ]
    .map((d) => ({
      id: d.id,
      name: d.name,
      fileUrl: d.fileUrl,
      clientId: d.clientId,
      projectId: d.projectId,
      projectName: d.projectName,
      shareToken: d.shareToken,
      shareExpiresAt: d.shareExpiresAt ? new Date(d.shareExpiresAt).toISOString() : null,
      shareOpenCount: d.shareOpenCount,
      shareLastOpenedAt: d.shareLastOpenedAt ? new Date(d.shareLastOpenedAt).toISOString() : null,
      addedAt: new Date(d.createdAt).toISOString(),
      added: addedLabel(d.createdAt),
    }))
    // Newest first, across all clients.
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} document${documents.length === 1 ? "" : "s"} across all clients`}
      />

      {clients.length === 0 && documents.length === 0 ? (
        <EmptyState message="Add a client first. Documents are filed under the client they belong to." />
      ) : (
        <ClientDocuments
          title="All documents"
          toolbar="always"
          clients={clients.map((c) => ({ id: c.id, slug: c.slug, name: c.name, jobs: c.projects }))}
          documents={documents}
        />
      )}
    </div>
  );
}
