import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true, transactions: true } } },
  });

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
        <div className="grid grid-cols-2 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={routes.clients.item(client.id)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
            >
              <h3 className="text-[14.5px] font-semibold text-zinc-100 mb-0.5">{client.name}</h3>
              {client.company && <p className="text-[12.5px] text-zinc-500 mb-3">{client.company}</p>}
              <div className="flex items-center gap-4 text-[12px] text-zinc-500">
                <span>{client._count.projects} project{client._count.projects === 1 ? "" : "s"}</span>
                <span>{client._count.transactions} transaction{client._count.transactions === 1 ? "" : "s"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
