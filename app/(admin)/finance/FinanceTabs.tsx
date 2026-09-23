"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { MonthFilter } from "./MonthFilter";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import { DeleteInvoiceButton } from "../invoices/DeleteInvoiceButton";

type Tab = "transactions" | "invoices";

interface TransactionRow {
  id: string;
  date: Date;
  type: string;
  amount: number;
  currency: string;
  category: string | null;
  description: string | null;
  client: { name: string } | null;
}

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  status: string;
  currency: string;
  total: number;
  client: { name: string } | null;
}

interface Props {
  month: string;
  transactions: TransactionRow[];
  income: number;
  expense: number;
  net: number;
  currency: string;
  invoices: InvoiceRow[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  OVERDUE: "bg-red-500/15 text-red-400",
};

export function FinanceTabs({ month, transactions, income, expense, net, currency, invoices }: Props) {
  const [tab, setTab] = useState<Tab>("transactions");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Finance</h1>
          <p className="text-[13px] text-zinc-500">Income, expenses, and invoices.</p>
        </div>
        {tab === "transactions" ? (
          <div className="flex items-center gap-3">
            <MonthFilter month={month} />
            <Link
              href={routes.finance.new}
              className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
            >
              + New transaction
            </Link>
          </div>
        ) : (
          <Link
            href={routes.invoices.new}
            className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
          >
            + New invoice
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setTab("transactions")}
          className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            tab === "transactions" ? "border-emerald-400 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Transactions
        </button>
        <button
          type="button"
          onClick={() => setTab("invoices")}
          className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            tab === "invoices" ? "border-emerald-400 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Invoices
        </button>
      </div>

      {tab === "transactions" && (
        <div>
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
      )}

      {tab === "invoices" && (
        <div>
          {invoices.length === 0 ? (
            <EmptyState message="No invoices yet." />
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Number</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Client</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Issued</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Total</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40">
                      <td className="px-4 py-3">
                        <Link href={routes.invoices.item(inv.id)} className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-zinc-400">{inv.client?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-400 whitespace-nowrap">
                        {inv.issueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[13.5px] font-medium text-zinc-200">
                        {inv.total.toLocaleString()} {inv.currency}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={routes.invoices.edit(inv.id)} className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                            Edit
                          </Link>
                          <DeleteInvoiceButton id={inv.id} number={inv.invoiceNumber} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
