import { prisma } from "@/app/lib/prisma";
import { ClientsClient } from "./ClientsClient";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true, transactions: true } } },
  });

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
