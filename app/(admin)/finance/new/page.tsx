import { prisma } from "@/app/lib/prisma";
import { TransactionForm } from "../TransactionForm";

interface Props {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NewTransactionPage({ searchParams }: Props) {
  const { clientId } = await searchParams;
  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-foreground mb-8">New transaction</h1>
      <TransactionForm mode="new" clients={clients} projects={projects} initial={clientId ? { clientId } : undefined} />
    </div>
  );
}
