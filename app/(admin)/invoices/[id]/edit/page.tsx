import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";
import { InvoiceForm } from "../../InvoiceForm";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: Props) {
  const { id } = await params;
  const [invoice, clients, projects] = await Promise.all([
    prisma.invoice.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!invoice) notFound();

  const items = (invoice.items as unknown as InvoiceItem[]) ?? [];

  return (
    <div>
      <BackLink href={routes.invoices.item(invoice.id)} label={invoice.invoiceNumber} />
      <h1 className="text-[22px] font-semibold text-zinc-100 mt-1 mb-8">Edit invoice</h1>

      <InvoiceForm
        mode="edit"
        invoiceId={invoice.id}
        clients={clients}
        projects={projects}
        initial={{
          clientId: invoice.clientId ?? "",
          projectId: invoice.projectId ?? "",
          status: invoice.status,
          issueDate: invoice.issueDate.toISOString().slice(0, 10),
          dueDate: invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : "",
          currency: invoice.currency,
          notes: invoice.notes ?? "",
          items: items.map((i) => ({ description: i.description, quantity: String(i.quantity), rate: String(i.rate) })),
        }}
      />
    </div>
  );
}
