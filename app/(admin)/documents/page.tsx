import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";

const getDocuments = unstable_cache(
  () =>
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    }),
  ["documents-list"],
  { tags: [CACHE_TAGS.documents, CACHE_TAGS.clients, CACHE_TAGS.freelance], revalidate: 60 }
);

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} document${documents.length === 1 ? "" : "s"} across all clients and projects`}
      />

      {documents.length === 0 ? (
        <EmptyState message="No documents yet — add one from a client's or project's page." />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Belongs to</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Added</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                // unstable_cache round-trips through JSON, so Date fields come back as strings.
                const createdAt = new Date(doc.createdAt);
                return (
                  <tr key={doc.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                    <td className="px-4 py-3">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors">
                        {doc.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {doc.client ? (
                        <Link href={routes.clients.item(doc.client.id)} className="text-primary hover:text-primary transition-colors">
                          {doc.client.name}
                        </Link>
                      ) : doc.project ? (
                        <Link href={routes.projects.item(doc.project.id)} className="text-primary hover:text-primary transition-colors">
                          {doc.project.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                      {createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
