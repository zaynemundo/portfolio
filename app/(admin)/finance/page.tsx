import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { FinanceTabs } from "./FinanceTabs";

interface Props {
  searchParams: Promise<{ month?: string }>;
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

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const getFinanceData = unstable_cache(
  (month: string) => {
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);

    return Promise.all([
      prisma.transaction.findMany({
        where: { date: { gte: start, lt: end } },
        orderBy: { date: "desc" },
        include: { client: true, project: true },
      }),
      prisma.invoice.findMany({
        orderBy: { issueDate: "desc" },
        include: { client: true },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.freelanceProject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
  },
  ["finance-data"],
  { tags: [CACHE_TAGS.transactions, CACHE_TAGS.invoices, CACHE_TAGS.clients, CACHE_TAGS.freelance], revalidate: 60 }
);

export default async function FinancePage({ searchParams }: Props) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();

  const [transactions, invoices, clients, projects] = await getFinanceData(month);

  const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;
  const currency = transactions[0]?.currency ?? "AED";

  return (
    <FinanceTabs
      month={month}
      income={income}
      expense={expense}
      net={net}
      currency={currency}
      clients={clients}
      projects={projects}
      transactions={transactions.map((t) => {
        // unstable_cache round-trips through JSON, so Date fields come back as strings.
        const date = new Date(t.date);
        return {
          id: t.id,
          date: date.toISOString().slice(0, 10),
          displayDate: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          type: t.type,
          amount: String(t.amount),
          currency: t.currency,
          category: t.category ?? "",
          description: t.description ?? "",
          clientId: t.clientId ?? "",
          projectId: t.projectId ?? "",
          clientName: t.client?.name ?? null,
        };
      })}
      invoices={invoices.map((inv) => {
        const issueDate = new Date(inv.issueDate);
        const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientId: inv.clientId ?? "",
          projectId: inv.projectId ?? "",
          status: inv.status,
          issueDate: issueDate.toISOString().slice(0, 10),
          displayIssueDate: issueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : "",
          currency: inv.currency,
          notes: inv.notes ?? "",
          items: (inv.items as unknown as InvoiceItem[]).map((i) => ({
            description: i.description,
            quantity: String(i.quantity),
            rate: String(i.rate),
          })),
          clientName: inv.client?.name ?? null,
          total: computeInvoiceTotal(inv.items),
        };
      })}
    />
  );
}
