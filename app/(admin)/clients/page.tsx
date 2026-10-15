import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import Link from "next/link";
import { ClientCardMenu } from "./ClientCardMenu";
import { StatusPill } from "@/app/(admin)/_components/ui/StatusPill";
import { PageTable } from "@/app/(admin)/_components/ui/DataTable";
import { routes } from "@/app/(admin)/_routes";

const TYPE_LABEL = { COMPANY: "Company", INDIVIDUAL: "Individual" } as const;

const getClients = unstable_cache(
  () =>
    prisma.client.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { projects: true, transactions: true } },
        projects: { select: { status: true, archived: true } },
      },
    }),
  ["clients-list"],
  { tags: [CACHE_TAGS.clients, CACHE_TAGS.freelance, CACHE_TAGS.transactions], revalidate: 60 }
);

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        actionHref={routes.clients.new}
        actionLabel="+ New client"
      />

      {clients.length === 0 ? (
        <EmptyState message="No clients yet." />
      ) : (
        <PageTable
          searchPlaceholder="Search by name or company…"
          defaultSort={{ column: 0, direction: "asc" }}
          filters={[
            { key: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
            { key: "type", label: "Type", options: [{ value: "COMPANY", label: "Company" }, { value: "INDIVIDUAL", label: "Individual" }] },
          ]}
          columns={[{ label: "Name" }, { label: "Type" }, { label: "Company" }, { label: "Jobs" }, { label: "Status" }, { className: "w-12" }]}
          rows={clients.map((client) => {
            const type = client.type ? TYPE_LABEL[client.type] : null;
            // Active means there's still work on: a job that isn't completed or archived.
            const active = client.projects.some((p) => p.status !== "COMPLETED" && !p.archived);
            return {
              id: client.id,
              className: "group relative",
              search: `${client.name} ${client.company ?? ""}`,
              sort: [client.name, type, client.company, client._count.projects, active ? "Active" : "Inactive", undefined],
              filters: { status: active ? "active" : "inactive", type: client.type ?? "" },
              cells: (
                <>
                  <td className="px-4 py-3 text-[13.5px] font-medium text-foreground group-hover:text-primary transition-colors">
                    <Link href={routes.clients.item(client.slug ?? client.id)} className="absolute inset-0 z-0" aria-label={`Open ${client.name}`} />
                    <span className="relative pointer-events-none">{client.name}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{type ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{client.company ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground tabular-nums">{client._count.projects}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={active ? "positive" : "neutral"}>{active ? "Active" : "Inactive"}</StatusPill>
                  </td>
                  <td className="px-4 py-3 relative z-10">
                    <ClientCardMenu id={client.id} name={client.name} />
                  </td>
                </>
              ),
            };
          })}
        />
      )}
    </div>
  );
}
