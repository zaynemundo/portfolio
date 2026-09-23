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

  const [transactions, invoices] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
      include: { client: true, project: true },
    }),
    prisma.invoice.findMany({
      orderBy: { issueDate: "desc" },
      include: { client: true },
    }),
  ]);

  const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;
  const currency = transactions[0]?.currency ?? "AED";

  return (
    <FinanceTabs
      month={month}
      transactions={transactions}
      income={income}
      expense={expense}
      net={net}
      currency={currency}
      invoices={invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate,
        status: inv.status,
        currency: inv.currency,
        total: computeInvoiceTotal(inv.items),
        client: inv.client,
      }))}
    />
  );
}
