import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { invoiceTotals } from "@/app/lib/invoice-math";
import { ProjectForm } from "../ProjectForm";
import { TaskList } from "../TaskList";
import { AccessList, type AccessItem } from "@/app/(admin)/_components/AccessList";
import { InvoiceList } from "../InvoiceList";
import { JobClientPanel, JobMoneyStrip, JobTransactions, type JobMoney } from "../JobPanels";
import { JobDocuments } from "@/app/(admin)/_components/DocumentList";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup?: string }>;
}

/** yyyy-mm-dd for a date input; unstable_cache hands dates back as strings, so accept both. */
function toDateInput(value: Date | string | null): string {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

/** The job page is the hub: everything that belongs to a job is loaded here in one go. */
const getProjectDetail = unstable_cache(
  (id: string) =>
    Promise.all([
      prisma.freelanceProject.findUnique({
        where: { id },
        include: {
          tasks: { orderBy: { sortOrder: "asc" } },
          invoices: { orderBy: { issueDate: "asc" }, include: { payments: true } },
          documents: { orderBy: { createdAt: "desc" } },
          access: { orderBy: { sortOrder: "asc" } },
          transactions: { orderBy: { date: "desc" } },
          clientRecord: {
            include: {
              contacts: { orderBy: { sortOrder: "asc" } },
              // The client's logins for all of their jobs show on every job.
              access: { where: { projectId: null }, orderBy: { sortOrder: "asc" } },
              // The client's full set, so documents can be picked onto this job.
              documents: { orderBy: { name: "asc" }, include: { project: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]),
  ["freelance-project-detail"],
  {
    tags: [CACHE_TAGS.freelance, CACHE_TAGS.clients, CACHE_TAGS.invoices, CACHE_TAGS.transactions, CACHE_TAGS.documents],
    revalidate: 60,
  }
);

export default async function FreelanceProjectDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { setup } = await searchParams;
  const [project, clients] = await getProjectDetail(id);
  if (!project) notFound();

  const currency = project.rateCurrency ?? "AED";
  const documents = project.invoices.map((inv) => {
    const totals = invoiceTotals(inv);
    return {
      id: inv.id,
      isQuote: inv.kind === "QUOTE",
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      currency: inv.currency,
      total: totals.total,
      paid: totals.paid,
      balance: totals.balance,
    };
  });
  const invoices = documents.filter((d) => !d.isQuote);
  // The agreed price: a fixed rate if one is set, otherwise what the client accepted in a quote.
  const acceptedQuote = documents.filter((d) => d.isQuote && d.status === "ACCEPTED" && d.currency === currency).at(-1);

  // Totals only add up within one currency, so anything in another currency is left out and flagged.
  const sameCurrencyInvoices = invoices.filter((inv) => inv.currency === currency);
  const sameCurrencyExpenses = project.transactions.filter((t) => t.type === "EXPENSE" && t.currency === currency);
  const sent = sameCurrencyInvoices.filter((inv) => inv.status !== "DRAFT");
  const money: JobMoney = {
    currency,
    value:
      project.rateType === "FIXED" && project.rateAmount != null ? project.rateAmount : (acceptedQuote?.total ?? null),
    invoiced: sent.reduce((total, inv) => total + inv.total, 0),
    paid: sent.reduce((total, inv) => total + inv.paid, 0),
    overdue: sent.filter((inv) => inv.status === "OVERDUE").reduce((total, inv) => total + inv.balance, 0),
    expenses: sameCurrencyExpenses.reduce((total, t) => total + t.amount, 0),
    mixedCurrencies:
      invoices.some((inv) => inv.currency !== currency) || project.transactions.some((t) => t.currency !== currency),
  };

  return (
    <div>
      <BackLink href={routes.projects.list} label="Jobs" iconOnly />

      <div className="mt-4">
        <ProjectForm
          projectId={project.id}
          setup={setup === "1"}
          clients={clients}
          initial={{
            name: project.name,
            nextAction: project.nextAction ?? "",
            clientId: project.clientId ?? "",
            status: project.status,
            rateAmount: project.rateAmount != null ? String(project.rateAmount) : "",
            rateCurrency: currency,
            rateType: project.rateType ?? "",
            attachmentUrl: project.attachmentUrl ?? "",
            startDate: toDateInput(project.startDate),
            endDate: toDateInput(project.endDate),
            description: project.description ?? "",
            archived: project.archived,
          }}
          summary={<JobMoneyStrip money={money} />}
          main={
            <>
              <TaskList
                projectId={project.id}
                today={toDateInput(new Date())}
                tasks={project.tasks.map((t) => ({ id: t.id, title: t.title, done: t.done, dueDate: toDateInput(t.dueDate) }))}
              />
              <InvoiceList projectId={project.id} documents={documents} />
              <JobTransactions
                projectId={project.id}
                clientId={project.clientId}
                transactions={project.transactions.map((t) => ({
                  id: t.id,
                  displayDate: new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
                  type: t.type,
                  amount: t.amount,
                  currency: t.currency,
                  label: t.description ?? t.category ?? (t.type === "INCOME" ? "Payment" : "Expense"),
                }))}
              />
            </>
          }
          aside={
            <>
              <JobClientPanel
                client={
                  project.clientRecord
                    ? {
                        id: project.clientRecord.id,
                        slug: project.clientRecord.slug,
                        name: project.clientRecord.name,
                        company: project.clientRecord.company,
                        contacts: project.clientRecord.contacts.map((c) => ({
                          id: c.id, name: c.name, role: c.role, email: c.email, phone: c.phone,
                        })),
                      }
                    : null
                }
              />
              <AccessList
                clientId={project.clientId}
                projectId={project.id}
                items={[...project.access, ...(project.clientRecord?.access ?? [])].map((a): AccessItem => ({
                  id: a.id,
                  label: a.label,
                  url: a.url ?? "",
                  username: a.username ?? "",
                  hasPassword: a.passwordEncrypted !== null,
                  notes: a.notes ?? "",
                  projectId: a.projectId,
                }))}
              />
              <JobDocuments
                projectId={project.id}
                client={project.clientRecord ? { id: project.clientRecord.id, slug: project.clientRecord.slug, name: project.clientRecord.name } : null}
                documents={project.documents.map((d) => ({
                  id: d.id,
                  name: d.name,
                  fileUrl: d.fileUrl,
                  shareToken: d.shareToken,
                  shareExpiresAt: d.shareExpiresAt ? new Date(d.shareExpiresAt).toISOString() : null,
                  shareOpenCount: d.shareOpenCount,
                  shareLastOpenedAt: d.shareLastOpenedAt ? new Date(d.shareLastOpenedAt).toISOString() : null,
                }))}
                available={(project.clientRecord?.documents ?? [])
                  .filter((d) => d.projectId !== project.id)
                  .map((d) => ({ id: d.id, name: d.name, otherJobName: d.project?.name ?? null }))}
              />
            </>
          }
        />
      </div>

    </div>
  );
}
