"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { routes } from "@/app/(admin)/_routes";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { Modal } from "@/app/(admin)/_components/Modal";
import { MonthFilter } from "./MonthFilter";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import { DeleteInvoiceButton } from "../invoices/DeleteInvoiceButton";
import { TransactionForm } from "./TransactionForm";
import { InvoiceForm } from "../invoices/InvoiceForm";
import type { TransactionFormData } from "@/app/actions/finance";
import type { InvoiceFormData, InvoiceItemInput } from "@/app/actions/invoices";

type Tab = "transactions" | "invoices";

interface Option {
  id: string;
  name: string;
}

export interface TransactionRow {
  id: string;
  date: string; // yyyy-mm-dd
  displayDate: string;
  type: string;
  amount: string;
  currency: string;
  category: string;
  description: string;
  clientId: string;
  projectId: string;
  clientName: string | null;
}

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string;
  status: string;
  issueDate: string; // yyyy-mm-dd
  displayIssueDate: string;
  dueDate: string;
  currency: string;
  notes: string;
  items: InvoiceItemInput[];
  clientName: string | null;
  total: number;
}

interface Props {
  month: string;
  transactions: TransactionRow[];
  income: number;
  expense: number;
  net: number;
  currency: string;
  invoices: InvoiceRow[];
  clients: Option[];
  projects: Option[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  OVERDUE: "bg-red-500/15 text-red-400",
};

export function FinanceTabs({ month, transactions, income, expense, net, currency, invoices, clients, projects }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("transactions");
  const [txModal, setTxModal] = useState<"new" | TransactionRow | null>(null);
  const [invModal, setInvModal] = useState<"new" | InvoiceRow | null>(null);

  function closeTx() {
    setTxModal(null);
    router.refresh();
  }
  function closeInv() {
    setInvModal(null);
    router.refresh();
  }

  const editingTx = txModal && txModal !== "new" ? txModal : null;
  const txInitial: Partial<TransactionFormData> | undefined = editingTx
    ? {
        date: editingTx.date, type: editingTx.type, amount: editingTx.amount, currency: editingTx.currency,
        category: editingTx.category, description: editingTx.description, clientId: editingTx.clientId, projectId: editingTx.projectId,
      }
    : undefined;

  const editingInv = invModal && invModal !== "new" ? invModal : null;
  const invInitial: Partial<InvoiceFormData> | undefined = editingInv
    ? {
        clientId: editingInv.clientId, projectId: editingInv.projectId, status: editingInv.status,
        issueDate: editingInv.issueDate, dueDate: editingInv.dueDate, currency: editingInv.currency,
        notes: editingInv.notes, items: editingInv.items,
      }
    : undefined;

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
            <button
              type="button"
              onClick={() => setTxModal("new")}
              className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
            >
              + New transaction
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setInvModal("new")}
            className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
          >
            + New invoice
          </button>
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
                      <td className="px-4 py-3 text-[13px] text-zinc-400 whitespace-nowrap">{t.displayDate}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setTxModal(t)} className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors text-left">
                          {t.description || t.category || "—"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-zinc-400">{t.clientName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-400">{t.category || "—"}</td>
                      <td className={`px-4 py-3 text-right text-[13.5px] font-medium ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                        {t.type === "INCOME" ? "+" : "-"}{Number(t.amount).toLocaleString()} {t.currency}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button type="button" onClick={() => setTxModal(t)} className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                            Edit
                          </button>
                          <DeleteTransactionButton id={t.id} onDeleted={() => router.refresh()} />
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
                      <td className="px-4 py-3 text-[13px] text-zinc-400">{inv.clientName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-400 whitespace-nowrap">{inv.displayIssueDate}</td>
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
                          <button type="button" onClick={() => setInvModal(inv)} className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
                            Edit
                          </button>
                          <DeleteInvoiceButton id={inv.id} number={inv.invoiceNumber} onDeleted={() => router.refresh()} />
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

      <Modal open={txModal !== null} onClose={closeTx} title={editingTx ? "Edit transaction" : "New transaction"}>
        <TransactionForm
          mode={editingTx ? "edit" : "new"}
          transactionId={editingTx?.id}
          initial={txInitial}
          clients={clients}
          projects={projects}
          onSuccess={closeTx}
        />
      </Modal>

      <Modal open={invModal !== null} onClose={closeInv} title={editingInv ? editingInv.invoiceNumber : "New invoice"} maxWidthClassName="max-w-2xl">
        <InvoiceForm
          mode={editingInv ? "edit" : "new"}
          invoiceId={editingInv?.id}
          initial={invInitial}
          clients={clients}
          projects={projects}
          onSuccess={closeInv}
        />
      </Modal>
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
