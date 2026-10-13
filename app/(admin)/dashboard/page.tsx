import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { invoiceTotals } from "@/app/lib/invoice-math";
import { routes } from "@/app/(admin)/_routes";
import { ArrowDown, ArrowUp } from "lucide-react";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { Panel, PanelRow, StatStrip } from "@/app/(admin)/_components/OverviewParts";
import { Card, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { JOB_STATUS } from "@/app/(admin)/_components/ui/StatusPill";
import { StatusBadge } from "../freelance/StatusBadge";

/* The Freelance overview answers three questions, in this order: what have
 * I earned, who owes me, and what needs doing next. Everything on it is a
 * view onto jobs, invoices and leads — nothing is edited here. */

/** Totals are shown in this currency; anything else is left out and flagged. */
const DEFAULT_CURRENCY = "AED";
const DUE_SOON_DAYS = 7;
/** How many months the income and expenses chart covers, this month included. */
const CHART_MONTHS = 6;
const JOB_STATUS_ORDER = ["ACTIVE", "ON_HOLD", "NOT_STARTED", "COMPLETED"];

/** "Harbour Co." → "HC": the letters in a client's round badge. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? (words[words.length - 1][0] ?? "") : (words[0]?.[1] ?? ""))).toUpperCase();
}

function money(amount: number): string {
  return `${DEFAULT_CURRENCY} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function shortDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const getOverviewData = unstable_cache(
  async (dayKey: string) => {
    const today = new Date(dayKey);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const chartStart = new Date(today.getFullYear(), today.getMonth() - (CHART_MONTHS - 1), 1);
    const dueSoon = new Date(today);
    dueSoon.setDate(dueSoon.getDate() + DUE_SOON_DAYS);

    return Promise.all([
      prisma.invoice.findMany({
        where: { kind: "INVOICE", status: { in: ["SENT", "OVERDUE"] } },
        orderBy: { dueDate: "asc" },
        include: { client: true, payments: true },
      }),
      // Everything the chart covers; this month's figures are picked out of it below.
      prisma.transaction.findMany({ where: { date: { gte: chartStart, lt: monthEnd } } }),
      prisma.inquiry.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.freelanceTask.findMany({
        where: { done: false, dueDate: { not: null, lte: dueSoon }, project: { archived: false } },
        orderBy: { dueDate: "asc" },
        take: 8,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.freelanceProject.findMany({
        where: { archived: false },
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
  const [openInvoices, recentTransactions, unreadLeads, dueTasks, allJobs] = await getOverviewData(dayKey);
  const jobs = allJobs.filter((j) => j.status !== "COMPLETED");

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
  // One entry per month the chart covers, oldest first; the last one is this month.
  const months = Array.from({ length: CHART_MONTHS }, (_, i) => {
    const start = new Date(today.getFullYear(), today.getMonth() - (CHART_MONTHS - 1 - i), 1);
    const inMonth = inDefault(recentTransactions).filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === start.getFullYear() && date.getMonth() === start.getMonth();
    });
    return {
      label: start.toLocaleDateString("en-GB", { month: "short" }),
      income: inMonth.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0),
      expense: inMonth.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0),
    };
  });
  const monthIncome = months[CHART_MONTHS - 1].income;
  const monthExpense = months[CHART_MONTHS - 1].expense;
  const lastMonthIncome = months[CHART_MONTHS - 2].income;
  // Only meaningful when there was something to compare against.
  const incomeChange = lastMonthIncome > 0 ? ((monthIncome - lastMonthIncome) / lastMonthIncome) * 100 : null;
  const chartMax = Math.max(...months.flatMap((m) => [m.income, m.expense]));
  const otherCurrencies = [...invoices, ...recentTransactions].some((r) => r.currency !== DEFAULT_CURRENCY);
  const monthName = now.toLocaleDateString("en-GB", { month: "long" });
  const [incomeWhole, incomeCents] = monthIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(".");

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

      {/* The headline: what came in this month, against last month, with the other three figures beside it. */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:items-end">
        <Link href={`${routes.finance.list}?tab=transactions`} className="block group">
          <p className="text-[13px] font-medium text-muted-foreground">Earned in {monthName}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[40px] leading-none font-bold tracking-tight tabular-nums text-foreground group-hover:text-primary transition-colors">
              {DEFAULT_CURRENCY} {incomeWhole}
              <span className="text-muted-foreground/50">.{incomeCents}</span>
            </span>
            {incomeChange !== null && (
              <span
                className={`inline-flex items-center gap-1 self-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold tabular-nums ${
                  incomeChange >= 0 ? "bg-positive/12 text-positive" : "bg-negative/12 text-negative"
                }`}
              >
                {incomeChange >= 0 ? <ArrowUp size={11} strokeWidth={2.5} /> : <ArrowDown size={11} strokeWidth={2.5} />}
                {Math.abs(incomeChange).toFixed(1)}%
              </span>
            )}
          </p>
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            {lastMonthIncome > 0 ? `${money(lastMonthIncome)} last month` : "Nothing recorded last month to compare with"}
          </p>
        </Link>

        <StatStrip
          cells={[
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
            {
              label: `Expenses in ${monthName}`,
              value: money(monthExpense),
              note: monthExpense > 0 ? `${money(monthIncome - monthExpense)} left after expenses` : "None recorded",
              href: `${routes.finance.list}?tab=transactions`,
            },
          ]}
        />
      </div>
      {otherCurrencies && (
        <p className="text-[11.5px] text-muted-foreground mt-2">
          Amounts in currencies other than {DEFAULT_CURRENCY} are left out of these totals.
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        <Card>
          <CardHeader
            title={`Last ${CHART_MONTHS} months`}
            description={`Income and expenses in ${DEFAULT_CURRENCY}`}
            action={<Link href={`${routes.finance.list}?tab=transactions`} className={cardActionClass}>Finance</Link>}
          />
          {chartMax === 0 ? (
            <p className="px-5 pb-5 text-[13px] text-muted-foreground">
              Nothing recorded yet. Income appears here when an invoice is marked paid; expenses when you add them under Finance.
            </p>
          ) : (
            <div className="px-5 pb-5">
              <div className="flex items-end gap-3 h-40" role="img" aria-label={`Income and expenses for the last ${CHART_MONTHS} months`}>
                {months.map((m, i) => (
                  <div key={m.label} className="flex-1 min-w-0 h-full flex flex-col justify-end gap-1.5" title={`${m.label}: ${money(m.income)} in, ${money(m.expense)} out`}>
                    <div className="flex-1 flex items-end justify-center gap-1">
                      <div
                        className={`w-full max-w-7 rounded-t-lg rounded-b-sm ${i === CHART_MONTHS - 1 ? "bg-positive" : "bg-positive/45"}`}
                        style={{ height: `${Math.max(m.income > 0 ? 3 : 0, (m.income / chartMax) * 100)}%` }}
                      />
                      <div
                        className={`w-full max-w-7 rounded-t-lg rounded-b-sm ${i === CHART_MONTHS - 1 ? "bg-negative" : "bg-negative/40"}`}
                        style={{ height: `${Math.max(m.expense > 0 ? 3 : 0, (m.expense / chartMax) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-center text-[11.5px] ${i === CHART_MONTHS - 1 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-positive" aria-hidden="true" />Income</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-negative" aria-hidden="true" />Expenses</span>
                <span className="ml-auto tabular-nums">Highest month: {money(chartMax)}</span>
              </div>
            </div>
          )}
        </Card>

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
      </div>

      {/* Not clipped, so the table's menus can hang below a short list. */}
      <Card className="mt-5 overflow-visible">
        <CardHeader
          title="Jobs"
          count={allJobs.length}
          action={<Link href={routes.projects.list} className={cardActionClass}>All jobs</Link>}
        />
        {allJobs.length === 0 ? (
          <p className="px-5 pb-5 text-[13px] text-muted-foreground">No jobs yet. Start one with “New job”.</p>
        ) : (
          <DataTable
            toolbar="always"
            searchPlaceholder="Search jobs…"
            filters={[{ key: "status", label: "Status", options: JOB_STATUS_ORDER.map((status) => ({ value: status, label: JOB_STATUS[status].label })) }]}
            columns={[{ label: "Job", className: "px-5" }, { label: "Next action" }, { label: "Tasks" }, { label: "Due" }, { label: "Status", className: "px-5" }]}
            rows={allJobs.map((job) => {
              const done = job.tasks.filter((t) => t.done).length;
              const client = job.clientRecord?.name ?? null;
              const endDate = job.endDate ? new Date(job.endDate) : null;
              const late = endDate !== null && endDate < today && job.status !== "COMPLETED";
              return {
                id: job.id,
                className: "group relative",
                search: `${job.name} ${client ?? ""} ${job.nextAction ?? ""}`,
                sort: [job.name, job.nextAction || null, job.tasks.length ? done / job.tasks.length : null, endDate ? endDate.getTime() : null, JOB_STATUS_ORDER.indexOf(job.status)],
                filters: { status: job.status },
                cells: (
                  <>
                    <td className="px-5 py-3">
                      <Link href={routes.projects.item(job.id)} className="absolute inset-0 z-0" aria-label={`Open ${job.name}`} />
                      <span className="relative pointer-events-none flex items-center gap-3">
                        <span className="h-8 w-8 shrink-0 rounded-full bg-accent text-accent-foreground text-[11px] font-bold flex items-center justify-center" aria-hidden="true">
                          {initials(client ?? job.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">{job.name}</span>
                          <span className="block text-[12px] text-muted-foreground truncate">{client ?? "No client"}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-foreground/80 pointer-events-none">{job.nextAction || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground tabular-nums whitespace-nowrap pointer-events-none">
                      {job.tasks.length ? `${done} / ${job.tasks.length}` : "—"}
                    </td>
                    <td className={`px-4 py-3 text-[13px] whitespace-nowrap pointer-events-none ${late ? "text-negative font-medium" : "text-muted-foreground"}`}>
                      {endDate ? shortDate(endDate) : "—"}
                    </td>
                    <td className="px-5 py-3 pointer-events-none">
                      <StatusBadge status={job.status} />
                    </td>
                  </>
                ),
              };
            })}
          />
        )}
      </Card>
    </div>
  );
}
