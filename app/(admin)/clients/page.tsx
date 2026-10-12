import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { ClientCardMenu } from "./ClientCardMenu";
import { routes } from "@/app/(admin)/_routes";

const getClients = unstable_cache(
  () =>
    prisma.client.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true, transactions: true } } },
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
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Jobs</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="group relative border-b border-border/70 last:border-b-0 hover:bg-card/40">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-foreground group-hover:text-primary transition-colors">
                    <Link href={routes.clients.item(client.slug ?? client.id)} className="absolute inset-0 z-0" aria-label={`Open ${client.name}`} />
                    <span className="relative pointer-events-none">{client.name}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">
                    {client.type ? (client.type === "COMPANY" ? "Company" : "Individual") : "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{client.company ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{client._count.projects}</td>
                  <td className="px-4 py-3 relative z-10">
                    <ClientCardMenu id={client.id} name={client.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
