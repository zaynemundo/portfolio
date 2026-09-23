import { prisma } from "@/app/lib/prisma";
import { InvoiceForm } from "../InvoiceForm";

export default async function NewInvoicePage() {
  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New invoice</h1>
      <InvoiceForm mode="new" clients={clients} projects={projects} />
    </div>
  );
}
