import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";
import { MonthFilter } from "./MonthFilter";
import { DeleteTransactionButton } from "./DeleteTransactionButton";

interface Props {
  searchParams: Promise<{ month?: string }>;
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

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
    include: { client: true, project: true },
  });

  const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;
  const currency = transactions[0]?.currency ?? "AED";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Finance</h1>
          <p className="text-[13px] text-zinc-500">Income and expenses, by month.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthFilter month={month} />
          <Link
            href={routes.finance.new}
            className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
          >
            + New transaction
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <TotalCard label="Income" value={income} currency={currency} accent="emerald" />
        <TotalCard label="Expenses" value={expense} currency={currency} accent="red" />
        <TotalCard label="Net" value={net} currency={currency} accent={net >= 0 ? "emerald" : "red"} />
      </div>

      {transactions.length === 0 ? (
        <EmptyState message="No transactions this month." />
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Date</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Description</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Client</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Category</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Amount</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-[13px] text-zinc-400 whitespace-nowrap">
                    {t.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={routes.finance.item(t.id)} className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors">
                      {t.description || t.category || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{t.client?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{t.category ?? "—"}</td>
                  <td className={`px-4 py-3 text-right text-[13.5px] font-medium ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{t.amount.toLocaleString()} {t.currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={routes.finance.item(t.id)} className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                        Edit
                      </Link>
                      <DeleteTransactionButton id={t.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TotalCard({
  label, value, currency, accent,
}: {
  label: string;
  value: number;
  currency: string;
  accent: "emerald" | "red";
}) {
  const colorClass = accent === "emerald" ? "text-emerald-400" : "text-red-400";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5">
      <div className={`text-[22px] font-semibold leading-none mb-1.5 ${colorClass}`}>
        {value.toLocaleString()} <span className="text-[13px] font-medium">{currency}</span>
      </div>
      <div className="text-[12px] text-zinc-500">{label}</div>
    </div>
  );
}
