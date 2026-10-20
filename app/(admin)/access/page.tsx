import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { AccessTable, AddAccessButton, type AccessItem } from "@/app/(admin)/_components/AccessList";

/* Every saved login in one table. Each row says which client (and job, if
 * any) it is under; the Filters menu narrows the table to one client. Logins
 * saved on a job that has no client yet show as "No client yet". Passwords
 * never come with the page, only whether one is saved; Show and Copy fetch
 * them one at a time. */

const getAccessByClient = unstable_cache(
  () =>
    Promise.all([
      prisma.client.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          projects: { orderBy: { updatedAt: "desc" }, select: { id: true, name: true } },
        },
      }),
      prisma.accessDetail.findMany({
        orderBy: [{ label: "asc" }],
        include: { project: { select: { name: true } } },
      }),
    ]),
  ["access-all"],
  { tags: [CACHE_TAGS.clients, CACHE_TAGS.freelance], revalidate: 60 }
);

export default async function AccessPage() {
  const [clients, rows] = await getAccessByClient();

  const items: AccessItem[] = rows.map((a) => ({
    id: a.id,
    label: a.label,
    url: a.url ?? "",
    username: a.username ?? "",
    hasPassword: a.passwordEncrypted !== null,
    notes: a.notes ?? "",
    projectId: a.projectId,
    clientId: a.clientId,
    projectName: a.project?.name ?? null,
  }));
  const clientOptions = clients.map((c) => ({ id: c.id, slug: c.slug, name: c.name, jobs: c.projects }));

  return (
    <div>
      <PageHeader
        title="Access"
        subtitle={`${items.length} login${items.length === 1 ? "" : "s"} across all clients`}
        primary={clients.length > 0 && <AddAccessButton clients={clientOptions} />}
      />

      {clients.length === 0 && items.length === 0 ? (
        <EmptyState message="Add a client first. Logins are filed under the client who gave them to you." />
      ) : (
        <AccessTable items={items} clients={clientOptions} />
      )}
    </div>
  );
}
