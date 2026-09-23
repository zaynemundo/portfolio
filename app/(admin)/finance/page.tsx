import { prisma } from "@/app/lib/prisma";
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

export default async function FinancePage({ searchParams }: Props) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();
  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1);

  const [transactions, invoices, clients, projects] = await Promise.all([
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
      transactions={transactions.map((t) => ({
        id: t.id,
        date: t.date.toISOString().slice(0, 10),
        displayDate: t.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        type: t.type,
        amount: String(t.amount),
        currency: t.currency,
        category: t.category ?? "",
        description: t.description ?? "",
        clientId: t.clientId ?? "",
        projectId: t.projectId ?? "",
        clientName: t.client?.name ?? null,
      }))}
      invoices={invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientId: inv.clientId ?? "",
        projectId: inv.projectId ?? "",
        status: inv.status,
        issueDate: inv.issueDate.toISOString().slice(0, 10),
        displayIssueDate: inv.issueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        dueDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : "",
        currency: inv.currency,
        notes: inv.notes ?? "",
        items: (inv.items as unknown as InvoiceItem[]).map((i) => ({
          description: i.description,
          quantity: String(i.quantity),
          rate: String(i.rate),
        })),
        clientName: inv.client?.name ?? null,
        total: computeInvoiceTotal(inv.items),
      }))}
    />
  );
}
