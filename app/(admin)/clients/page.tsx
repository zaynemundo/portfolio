import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { ClientsClient } from "./ClientsClient";

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
    <ClientsClient
      clients={clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        notes: c.notes,
        projectCount: c._count.projects,
        transactionCount: c._count.transactions,
      }))}
    />
  );
}
