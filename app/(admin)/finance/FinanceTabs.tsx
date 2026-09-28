"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { Modal } from "@/app/(admin)/_components/Modal";
import { MonthFilter } from "./MonthFilter";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import { TransactionForm } from "./TransactionForm";
import type { TransactionFormData } from "@/app/actions/finance";
import type { ClientOption } from "@/app/(admin)/_components/ClientSelect";

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

interface Props {
  month: string;
  transactions: TransactionRow[];
  income: number;
  expense: number;
  net: number;
  currency: string;
  clients: ClientOption[];
  projects: Option[];
}

/** Cross-client, cross-project income/expense list — the one deliberately
 *  global view left in Finance. Invoices moved to live on each Freelance
 *  Project's own page instead, since each project has its own invoices. */
export function FinanceTabs({ month, transactions, income, expense, net, currency, clients: initialClients, projects }: Props) {
  const router = useRouter();
  const [txModal, setTxModal] = useState<"new" | TransactionRow | null>(null);
  const [clients, setClients] = useState(initialClients);

  function addClient(client: ClientOption) {
    setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
  }

  function closeTx() {
    setTxModal(null);
    router.refresh();
  }

  const editingTx = txModal && txModal !== "new" ? txModal : null;
  const txInitial: Partial<TransactionFormData> | undefined = editingTx
    ? {
        date: editingTx.date, type: editingTx.type, amount: editingTx.amount, currency: editingTx.currency,
        category: editingTx.category, description: editingTx.description, clientId: editingTx.clientId, projectId: editingTx.projectId,
      }
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Finance</h1>
          <p className="text-[13px] text-zinc-500">Income and expenses across every client and project.</p>
        </div>
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

      <Modal open={txModal !== null} onClose={closeTx} title={editingTx ? "Edit transaction" : "New transaction"}>
        <TransactionForm
          mode={editingTx ? "edit" : "new"}
          transactionId={editingTx?.id}
          initial={txInitial}
          clients={clients}
          onClientCreated={addClient}
          projects={projects}
          onSuccess={closeTx}
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
