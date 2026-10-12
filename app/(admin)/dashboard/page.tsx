import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { invoiceTotals } from "@/app/lib/invoice-math";
import { routes } from "@/app/(admin)/_routes";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { Panel, PanelRow, StatStrip } from "@/app/(admin)/_components/OverviewParts";

/* The Freelance overview answers three questions, in this order: what have
 * I earned, who owes me, and what needs doing next. Everything on it is a
 * view onto jobs, invoices and leads — nothing is edited here. */

/** Totals are shown in this currency; anything else is left out and flagged. */
const DEFAULT_CURRENCY = "AED";
const DUE_SOON_DAYS = 7;

function money(amount: number): string {
  return `${DEFAULT_CURRENCY} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function shortDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const getOverviewData = unstable_cache(
  async (dayKey: string) => {
    const today = new Date(dayKey);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const dueSoon = new Date(today);
    dueSoon.setDate(dueSoon.getDate() + DUE_SOON_DAYS);

    return Promise.all([
      prisma.invoice.findMany({
        where: { kind: "INVOICE", status: { in: ["SENT", "OVERDUE"] } },
        orderBy: { dueDate: "asc" },
        include: { client: true, payments: true },
      }),
      prisma.transaction.findMany({ where: { date: { gte: monthStart, lt: monthEnd } } }),
      prisma.inquiry.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.freelanceTask.findMany({
        where: { done: false, dueDate: { not: null, lte: dueSoon }, project: { archived: false } },
        orderBy: { dueDate: "asc" },
        take: 8,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.freelanceProject.findMany({
        where: { archived: false, status: { not: "COMPLETED" } },
        orderBy: { updatedAt: "desc" },
        include: { tasks: { select: { done: true } }, clientRecord: { select: { name: true } } },
      }),
    ]);
  },
  ["freelance-overview"],
  {
    tags: [CACHE_TAGS.invoices, CACHE_TAGS.transactions, CACHE_TAGS.inquiries, CACHE_TAGS.freelance, CACHE_TAGS.clients],
    revalidate: 60,
  }
);

export default async function FreelanceOverviewPage() {
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const today = new Date(dayKey);
  const [openInvoices, monthTransactions, unreadLeads, dueTasks, jobs] = await getOverviewData(dayKey);

  /* ── Money ── */
  const inDefault = <T extends { currency: string }>(rows: T[]) => rows.filter((r) => r.currency === DEFAULT_CURRENCY);
  const invoices = openInvoices.map((inv) => ({
    ...inv,
    // What is still owed: the total less any deposits or part-payments.
    total: invoiceTotals(inv).balance,
    // A sent invoice past its due date counts as overdue even if nobody changed its status.
    isOverdue: inv.status === "OVERDUE" || (inv.dueDate !== null && new Date(inv.dueDate) < today),
  }));
  const owed = inDefault(invoices).reduce((sum, inv) => sum + inv.total, 0);
  const overdueInvoices = invoices.filter((inv) => inv.isOverdue);
  const overdue = inDefault(overdueInvoices).reduce((sum, inv) => sum + inv.total, 0);
  const monthIncome = inDefault(monthTransactions).filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = inDefault(monthTransactions).filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const otherCurrencies = [...invoices, ...monthTransactions].some((r) => r.currency !== DEFAULT_CURRENCY);
  const monthName = now.toLocaleDateString("en-GB", { month: "long" });

  /* ── Needs attention ── */
  const lateJobs = jobs.filter((j) => j.endDate !== null && new Date(j.endDate) < today);
  const attentionCount = overdueInvoices.length + unreadLeads.length + dueTasks.length + lateJobs.length;

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        actionHref={routes.projects.new}
        actionLabel="+ New job"
        secondaryHref={routes.invoices.new}
        secondaryLabel="New invoice"
      />

      <StatStrip
        cells={[
          { label: `Earned in ${monthName}`, value: money(monthIncome), tone: monthIncome > 0 ? "good" : undefined, href: `${routes.finance.list}?tab=transactions` },
          {
            label: "Owed to you",
            value: money(owed),
            note: invoices.length ? `${invoices.length} unpaid invoice${invoices.length === 1 ? "" : "s"}` : "No unpaid invoices",
            href: routes.finance.list,
          },
          {
            label: "Overdue",
            value: money(overdue),
            note: overdueInvoices.length ? `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? "" : "s"} past due` : "Nothing overdue",
            tone: overdue > 0 ? "bad" : undefined,
            href: routes.finance.list,
          },
          { label: `Expenses in ${monthName}`, value: money(monthExpense), href: `${routes.finance.list}?tab=transactions` },
        ]}
      />
      {otherCurrencies && (
        <p className="text-[11.5px] text-muted-foreground mt-2">
          Amounts in currencies other than {DEFAULT_CURRENCY} are left out of these totals.
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <Panel title="Needs attention" empty="Nothing needs your attention right now." isEmpty={attentionCount === 0}>
          <div>
            {overdueInvoices.map((inv) => (
              <PanelRow
                key={inv.id}
                href={routes.invoices.item(inv.id)}
                tag="Overdue"
                tagTone="bad"
                primary={`Invoice ${inv.invoiceNumber}`}
                secondary={inv.client?.name}
                right={`${inv.currency} ${inv.total.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                rightTone="bad"
              />
            ))}
            {unreadLeads.map((lead) => (
              <PanelRow
                key={lead.id}
                href={routes.inquiries.item(lead.id)}
                tag="New lead"
                tagTone="brand"
                primary={lead.name}
                secondary={lead.message.slice(0, 50)}
                right={shortDate(lead.createdAt)}
              />
            ))}
            {dueTasks.map((task) => {
              const late = task.dueDate !== null && new Date(task.dueDate) < today;
              return (
                <PanelRow
                  key={task.id}
                  href={routes.projects.item(task.project.id)}
                  tag={late ? "Late task" : "Due soon"}
                  tagTone={late ? "bad" : "warn"}
                  primary={task.title}
                  secondary={task.project.name}
                  right={task.dueDate ? shortDate(task.dueDate) : undefined}
                  rightTone={late ? "bad" : undefined}
                />
              );
            })}
            {lateJobs.map((job) => (
              <PanelRow
                key={job.id}
                href={routes.projects.item(job.id)}
                tag="Past end date"
                tagTone="warn"
                primary={job.name}
                secondary={job.clientRecord?.name}
                right={job.endDate ? shortDate(job.endDate) : undefined}
              />
            ))}
          </div>
        </Panel>

        <Panel
          title="Active jobs"
          actionHref={routes.projects.list}
          actionLabel="All jobs"
          empty="No active jobs. Start one with “New job”."
          isEmpty={jobs.length === 0}
        >
          <div>
            {jobs.map((job) => {
              const done = job.tasks.filter((t) => t.done).length;
              return (
                <Link
                  key={job.id}
                  href={routes.projects.item(job.id)}
                  className="block px-5 py-3 border-b border-border/70 last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[13.5px] font-medium text-foreground">{job.name}</span>
                    <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
                      {job.tasks.length ? `${done}/${job.tasks.length} tasks` : "No tasks"}
                      {job.endDate ? ` · due ${shortDate(job.endDate)}` : ""}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground truncate mt-0.5">
                    {job.clientRecord?.name ? `${job.clientRecord.name} · ` : ""}
                    {job.nextAction ? <span className="text-foreground/80">Next: {job.nextAction}</span> : "No next action set"}
                  </p>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
