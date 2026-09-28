import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { TransactionForm } from "../TransactionForm";
import { DeleteTransactionButton } from "../DeleteTransactionButton";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;
  const [transaction, clients, projects] = await Promise.all([
    prisma.transaction.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!transaction) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <BackLink href={routes.finance.list} label="Finance" />
          <h1 className="text-[22px] font-semibold text-zinc-100 mt-1">Edit transaction</h1>
        </div>
        <DeleteTransactionButton id={transaction.id} />
      </div>

      <TransactionForm
        mode="edit"
        transactionId={transaction.id}
        clients={clients}
        projects={projects}
        initial={{
          date: transaction.date.toISOString().slice(0, 10),
          type: transaction.type,
          amount: String(transaction.amount),
          currency: transaction.currency,
          category: transaction.category ?? "",
          description: transaction.description ?? "",
          clientId: transaction.clientId ?? "",
          projectId: transaction.projectId ?? "",
          attachmentUrl: transaction.attachmentUrl ?? "",
        }}
      />
    </div>
  );
}
