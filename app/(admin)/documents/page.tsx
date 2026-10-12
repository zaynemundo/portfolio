import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { ClientDocuments } from "@/app/(admin)/_components/DocumentList";
import { routes } from "@/app/(admin)/_routes";

/* Documents are filed by client: one list per client, and a filter to look
 * at a single client's list on its own. Which job a document shows on is
 * chosen on each row. */

interface Props {
  searchParams: Promise<{ client?: string }>;
}

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

export default async function DocumentsPage({ searchParams }: Props) {
  const { client: clientFilter } = await searchParams;
  const [clients, unfiled] = await getDocumentsByClient();

  const total = clients.reduce((sum, c) => sum + c.documents.length, 0) + unfiled.length;
  const selected = clients.find((c) => c.id === clientFilter);
  const shown = selected ? [selected] : clients;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors ${
      active ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/70 hover:bg-card"
    }`;

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${total} document${total === 1 ? "" : "s"}, filed by client`}
      />

      {clients.length === 0 ? (
        <EmptyState message="Add a client first. Documents are filed under the client they belong to." />
      ) : (
        <>
          {clients.length > 1 && (
            <nav aria-label="Filter by client" className="flex flex-wrap gap-2 mb-6">
              <Link href={routes.documents.list} className={chip(!selected)}>
                All clients
              </Link>
              {clients.map((c) => (
                <Link key={c.id} href={`${routes.documents.list}?client=${c.id}`} className={chip(selected?.id === c.id)}>
                  {c.name} <span className="tabular-nums opacity-70">{c.documents.length}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="space-y-5">
            {shown.map((c) => (
              <ClientDocuments
                key={c.id}
                clientId={c.id}
                title={c.name}
                titleHref={routes.clients.item(c.slug ?? c.id)}
                jobs={c.projects}
                documents={c.documents.map((d) => ({
                  id: d.id,
                  name: d.name,
                  fileUrl: d.fileUrl,
                  projectId: d.projectId,
                  shareToken: d.shareToken,
                  shareExpiresAt: d.shareExpiresAt ? new Date(d.shareExpiresAt).toISOString() : null,
                  added: addedLabel(d.createdAt),
                }))}
              />
            ))}
          </div>
        </>
      )}

      {!selected && unfiled.length > 0 && (
        <section className="rounded-xl border border-border bg-card/40 mt-5">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-[13.5px] font-semibold text-foreground">No client yet</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Uploaded on a job that has no client chosen.</p>
          </div>
          <ul>
            {unfiled.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 border-b border-border/70 last:border-b-0">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-foreground hover:text-primary transition-colors">
                  {doc.name}
                </a>
                <span className="text-[12px] text-muted-foreground whitespace-nowrap">{addedLabel(doc.createdAt)}</span>
                {doc.project && (
                  <Link href={routes.projects.item(doc.project.id)} className="text-[12.5px] font-medium text-primary hover:text-primary/80 transition-colors">
                    {doc.project.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
