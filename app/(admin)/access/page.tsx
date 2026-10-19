import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { routes } from "@/app/(admin)/_routes";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { AccessList, type AccessItem } from "@/app/(admin)/_components/AccessList";

/* Every saved login on one page, one card per client (the same card as on the
 * client's page, so logins can be added and edited here too). Logins saved on
 * a job that has no client yet get a card per job. Passwords never come with
 * the page, only whether one is saved; Show and Copy fetch them one at a time. */

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
          access: { orderBy: [{ projectId: "asc" }, { sortOrder: "asc" }] },
        },
      }),
      prisma.freelanceProject.findMany({
        where: { clientId: null, access: { some: {} } },
        orderBy: { name: "asc" },
        select: { id: true, name: true, access: { orderBy: { sortOrder: "asc" } } },
      }),
    ]),
  ["access-by-client"],
  { tags: [CACHE_TAGS.clients, CACHE_TAGS.freelance], revalidate: 60 }
);

type AccessRow = Awaited<ReturnType<typeof getAccessByClient>>[0][number]["access"][number];

function toItem(a: AccessRow): AccessItem {
  return {
    id: a.id,
    label: a.label,
    url: a.url ?? "",
    username: a.username ?? "",
    hasPassword: a.passwordEncrypted !== null,
    notes: a.notes ?? "",
    projectId: a.projectId,
  };
}

const titleLink = "hover:text-primary transition-colors";

export default async function AccessPage() {
  const [clients, clientlessJobs] = await getAccessByClient();
  const total = clients.reduce((n, c) => n + c.access.length, 0) + clientlessJobs.reduce((n, j) => n + j.access.length, 0);
  // Clients with logins first, so the ones in use aren't buried under empty cards.
  const ordered = [...clients].sort((a, b) => Number(b.access.length > 0) - Number(a.access.length > 0));

  return (
    <div>
      <PageHeader
        title="Access"
        subtitle={`${total} login${total === 1 ? "" : "s"} across all clients`}
      />

      {clients.length === 0 && clientlessJobs.length === 0 ? (
        <EmptyState message="Add a client first. Logins are filed under the client who gave them to you." />
      ) : (
        <div className="space-y-5">
          {ordered.map((c) => (
            <AccessList
              key={c.id}
              clientId={c.id}
              title={<Link href={routes.clients.item(c.slug ?? c.id)} className={titleLink}>{c.name}</Link>}
              jobs={c.projects}
              items={c.access.map(toItem)}
            />
          ))}
          {clientlessJobs.map((j) => (
            <AccessList
              key={j.id}
              clientId={null}
              projectId={j.id}
              title={<Link href={routes.projects.item(j.id)} className={titleLink}>{j.name}</Link>}
              items={j.access.map(toItem)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
