import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { invoiceTotals } from "@/app/lib/invoice-math";
import { ClientDetails } from "../ClientDetails";
import { ContactList } from "../ContactList";
import { ClientDocuments } from "@/app/(admin)/_components/DocumentList";
import { Panel, StatStrip } from "@/app/(admin)/_components/OverviewParts";
import { StatusBadge } from "../../freelance/StatusBadge";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";

interface Props {
  params: Promise<{ id: string }>;
}

/** Totals are shown in this currency; anything else is left out and flagged. */
const DEFAULT_CURRENCY = "AED";

function money(amount: number): string {
  return `${DEFAULT_CURRENCY} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}


/* The client page is an overview: where the money stands, who to talk to,
 * and everything filed or done for this client. */
export default async function ClientDetailPage({ params }: Props) {
  // The address normally carries the client's slug (/clients/davaolease); older links carry the id.
  const { id: slugOrId } = await params;
  const client = await prisma.client.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    include: {
      projects: { orderBy: { updatedAt: "desc" } },
      transactions: { orderBy: { date: "desc" } },
      contacts: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      invoices: { where: { kind: "INVOICE", status: { in: ["SENT", "OVERDUE"] } }, include: { payments: true } },
    },
  });
  if (!client) notFound();

  const today = new Date(new Date().toISOString().slice(0, 10));
  const inDefault = <T extends { currency: string }>(rows: T[]) => rows.filter((r) => r.currency === DEFAULT_CURRENCY);
  const transactions = inDefault(client.transactions);
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const openInvoices = inDefault(client.invoices).map((inv) => ({
    balance: invoiceTotals(inv).balance,
    isOverdue: inv.status === "OVERDUE" || (inv.dueDate !== null && inv.dueDate < today),
  }));
  const owed = openInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const overdue = openInvoices.filter((inv) => inv.isOverdue).reduce((sum, inv) => sum + inv.balance, 0);
  const activeJobs = client.projects.filter((p) => p.status !== "COMPLETED" && !p.archived).length;
  const otherCurrencies =
    client.transactions.some((t) => t.currency !== DEFAULT_CURRENCY) || client.invoices.some((i) => i.currency !== DEFAULT_CURRENCY);

  return (
    <div>
      <BackLink href={routes.clients.list} label="Clients" iconOnly />

      <div className="mt-4">
        <ClientDetails clientId={client.id} name={client.name} type={client.type ?? ""} company={client.company ?? ""} />
      </div>

      <div className="mt-8">
        <StatStrip
          cells={[
            { label: "Paid to you", value: money(totalIncome), tone: totalIncome > 0 ? "good" : undefined },
            {
              label: "Owed to you",
              value: money(owed),
              note:
                overdue > 0
                  ? `${money(overdue)} overdue`
                  : openInvoices.length
                    ? `${openInvoices.length} unpaid invoice${openInvoices.length === 1 ? "" : "s"}`
                    : "No unpaid invoices",
              tone: overdue > 0 ? "bad" : undefined,
            },
            { label: "Expenses", value: money(totalExpense) },
            {
              label: "Jobs",
              value: String(client.projects.length),
              note: activeJobs ? `${activeJobs} in progress` : client.projects.length ? "None in progress" : undefined,
            },
          ]}
        />
        {otherCurrencies && (
          <p className="text-[11.5px] text-muted-foreground mt-2">
            Amounts in currencies other than {DEFAULT_CURRENCY} are left out of these totals.
          </p>
        )}
      </div>

      <div className="space-y-5 mt-8">
        <Panel
          title="Jobs"
          actionHref={`${routes.projects.new}?clientId=${client.id}`}
          actionLabel="+ New job"
          empty="No jobs for this client yet."
          isEmpty={client.projects.length === 0}
          framed={false}
        >
          <DataTable
            searchPlaceholder="Search jobs…"
            columns={[{ label: "Name", className: "px-5" }, { label: "Status", className: "px-5" }, { label: "Updated", className: "px-5", align: "right" }]}
            rows={client.projects.map((p) => ({
              id: p.id,
              className: "group relative transition-colors",
              search: p.name,
              sort: [p.name, p.status, new Date(p.updatedAt).getTime()],
              cells: (
                <>
                  <td className="px-5 py-2.5 text-[13.5px] font-medium text-foreground group-hover:text-primary transition-colors">
                    <Link href={routes.projects.item(p.id)} className="absolute inset-0 z-0" aria-label={`Open ${p.name}`} />
                    <span className="relative pointer-events-none">{p.name}</span>
                  </td>
                  <td className="px-5 py-2.5 pointer-events-none">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-2.5 text-[12.5px] text-muted-foreground text-right whitespace-nowrap pointer-events-none">
                    {new Date(p.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                </>
              ),
            }))}
          />
        </Panel>

        <ContactList
          clientId={client.id}
          contacts={client.contacts.map((c) => ({
            id: c.id,
            name: c.name,
            role: c.role ?? "",
            email: c.email ?? "",
            phone: c.phone ?? "",
          }))}
        />

        <ClientDocuments
          clientId={client.id}
          hint="Everything filed for this client. Choose a job to show a document on that job's page."
          jobs={client.projects.map((p) => ({ id: p.id, name: p.name }))}
          documents={client.documents.map((d) => ({
            id: d.id,
            name: d.name,
            fileUrl: d.fileUrl,
            projectId: d.projectId,
            shareToken: d.shareToken,
            shareExpiresAt: d.shareExpiresAt ? new Date(d.shareExpiresAt).toISOString() : null,
            shareOpenCount: d.shareOpenCount,
            shareLastOpenedAt: d.shareLastOpenedAt ? new Date(d.shareLastOpenedAt).toISOString() : null,
            addedAt: new Date(d.createdAt).toISOString(),
            added: new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          }))}
        />

        <Panel
          title="Recent payments & expenses"
          actionHref={`${routes.finance.new}?clientId=${client.id}`}
          actionLabel="+ Add"
          empty="Nothing recorded for this client yet."
          isEmpty={client.transactions.length === 0}
        >
          <table className="w-full text-left">
            <tbody>
              {client.transactions.slice(0, 8).map((t) => (
                <tr key={t.id} className="group relative border-b border-border/70 last:border-b-0 hover:bg-primary/[0.06] transition-colors">
                  <td className="px-5 py-2.5 text-[12.5px] text-muted-foreground whitespace-nowrap">
                    <Link href={routes.finance.item(t.id)} className="absolute inset-0 z-0" aria-label="Open transaction" />
                    <span className="relative pointer-events-none">{new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  </td>
                  <td className="px-5 py-2.5 text-[13px] text-foreground/80 w-full pointer-events-none">{t.description ?? t.category ?? "—"}</td>
                  <td
                    className={`px-5 py-2.5 text-[13px] font-medium text-right whitespace-nowrap tabular-nums pointer-events-none ${
                      t.type === "INCOME" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {t.currency} {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
