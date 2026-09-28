import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">Clients</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{clients.length} client{clients.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href={routes.clients.new}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
        >
          + New client
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState message="No clients yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group relative rounded-xl border border-border bg-card/40 p-5 hover:border-border transition-colors"
            >
              <Link href={routes.clients.item(client.id)} className="absolute inset-0 z-0" aria-label={`Open ${client.name}`} />

              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 pointer-events-none">
                  <h3 className="text-[14.5px] font-semibold text-foreground group-hover:text-success transition-colors">{client.name}</h3>
                  {client.type && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {client.type === "COMPANY" ? "Company" : "Individual"}
                    </span>
                  )}
                </div>
                <div className="relative z-10 shrink-0">
                  <ClientCardMenu id={client.id} name={client.name} />
                </div>
              </div>

              {client.company && <p className="text-[12.5px] text-muted-foreground mb-3 pointer-events-none">{client.company}</p>}

              <div className="flex items-center gap-4 text-[12px] text-muted-foreground pointer-events-none">
                <span>{client._count.projects} project{client._count.projects === 1 ? "" : "s"}</span>
                <span>{client._count.transactions} transaction{client._count.transactions === 1 ? "" : "s"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
