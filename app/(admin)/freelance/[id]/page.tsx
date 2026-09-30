import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { ProjectForm } from "../ProjectForm";
import { TaskList } from "../TaskList";
import { InvoiceList } from "../InvoiceList";
import { DocumentList } from "@/app/(admin)/_components/DocumentList";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

function computeInvoiceTotal(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return (items as InvoiceItem[]).reduce((sum, i) => sum + (i.quantity || 0) * (i.rate || 0), 0);
}

const getProjectDetail = unstable_cache(
  (id: string) =>
    Promise.all([
      prisma.freelanceProject.findUnique({
        where: { id },
        include: {
          tasks: { orderBy: { sortOrder: "asc" } },
          invoices: { orderBy: { issueDate: "desc" } },
          documents: { orderBy: { createdAt: "desc" } },
        },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]),
  ["freelance-project-detail"],
  { tags: [CACHE_TAGS.freelance, CACHE_TAGS.clients, CACHE_TAGS.invoices], revalidate: 60 }
);

export default async function FreelanceProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const [project, clients] = await getProjectDetail(id);
  if (!project) notFound();

  // unstable_cache round-trips through JSON, so Date fields come back as strings.
  const startDate = project.startDate ? new Date(project.startDate) : null;
  const endDate = project.endDate ? new Date(project.endDate) : null;

  return (
    <div>
      <BackLink href={routes.projects.list} label="Freelance Projects" iconOnly />

      <div className="mt-4">
        <ProjectForm
          projectId={project.id}
          clients={clients}
          initial={{
            name: project.name,
            clientId: project.clientId ?? "",
            status: project.status,
            rateAmount: project.rateAmount != null ? String(project.rateAmount) : "",
            rateCurrency: project.rateCurrency ?? "AED",
            rateType: project.rateType ?? "",
            attachmentUrl: project.attachmentUrl ?? "",
            startDate: startDate ? startDate.toISOString().slice(0, 10) : "",
            endDate: endDate ? endDate.toISOString().slice(0, 10) : "",
            description: project.description ?? "",
            archived: project.archived,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mt-10">
        <TaskList projectId={project.id} tasks={project.tasks} />
        <DocumentList
          projectId={project.id}
          documents={project.documents.map((d) => ({ id: d.id, name: d.name, fileUrl: d.fileUrl }))}
        />
      </div>

      <div className="mt-10">
        <InvoiceList
          projectId={project.id}
          invoices={project.invoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            status: inv.status,
            currency: inv.currency,
            total: computeInvoiceTotal(inv.items),
          }))}
        />
      </div>
    </div>
  );
}
