import { prisma } from "@/app/lib/prisma";
import { InvoiceForm } from "../InvoiceForm";

interface Props {
  searchParams: Promise<{ projectId?: string; kind?: string }>;
}

export default async function NewInvoicePage({ searchParams }: Props) {
  const { projectId, kind: kindParam } = await searchParams;
  const kind = kindParam === "quote" ? "QUOTE" : "INVOICE";

  const [clients, projects, project] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    projectId ? prisma.freelanceProject.findUnique({ where: { id: projectId }, select: { clientId: true } }) : null,
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-foreground mb-8">{kind === "QUOTE" ? "New quote" : "New invoice"}</h1>
      <InvoiceForm
        mode="new"
        clients={clients}
        projects={projects}
        initial={{ kind, projectId: projectId ?? "", clientId: project?.clientId ?? "" }}
      />
    </div>
  );
}
