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
import type { TransactionFormData } from "@/app/actions/finance";
import type { ClientOption } from "@/app/(admin)/_components/ClientSelect";

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
  attachmentUrl: string;
}

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  status: string;
  displayIssueDate: string;
  currency: string;
  total: number;
  clientName: string | null;
  projectName: string | null;
}

interface Props {
  month: string;
  transactions: TransactionRow[];
  income: number;
  expense: number;
  net: number;
  currency: string;
  invoices: InvoiceRow[];
  clients: ClientOption[];
  projects: Option[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-success/15 text-success",
  OVERDUE: "bg-destructive/15 text-destructive",
};

/** Cross-client, cross-project income/expense/invoices view — the deliberately
 *  global finance picture. Invoices also live on each Freelance Project's own
 *  page (since each project has its own invoices), but the full set belongs
 *  here too — this is "our finance". */
export function FinanceTabs({ month, transactions, income, expense, net, currency, invoices, clients: initialClients, projects }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("transactions");
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
        attachmentUrl: editingTx.attachmentUrl,
      }
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground mb-1">Finance</h1>
          <p className="text-[13px] text-muted-foreground">Income, expenses, and invoices across every client and project.</p>
        </div>
        {tab === "transactions" ? (
          <div className="flex items-center gap-3">
            <MonthFilter month={month} />
            <button
              type="button"
              onClick={() => setTxModal("new")}
              className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
            >
              + New transaction
            </button>
          </div>
        ) : (
          <Link
            href={routes.invoices.new}
            className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            + New invoice
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("transactions")}
          className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            tab === "transactions" ? "border-success text-foreground" : "border-transparent text-muted-foreground hover:text-foreground/70"
          }`}
        >
          Transactions
        </button>
        <button
          type="button"
          onClick={() => setTab("invoices")}
          className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            tab === "invoices" ? "border-success text-foreground" : "border-transparent text-muted-foreground hover:text-foreground/70"
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
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                      <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">{t.displayDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setTxModal(t)} className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors text-left">
                            {t.description || t.category || "—"}
                          </button>
                          {t.attachmentUrl && (
                            <a
                              href={t.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View receipt / proof"
                              className="text-muted-foreground hover:text-foreground/70 transition-colors"
                            >
                              <ReceiptIcon />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{t.clientName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{t.category || "—"}</td>
                      <td className={`px-4 py-3 text-right text-[13.5px] font-medium ${t.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                        {t.type === "INCOME" ? "+" : "-"}{Number(t.amount).toLocaleString()} {t.currency}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button type="button" onClick={() => setTxModal(t)} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
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
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Number</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Project</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Issued</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
                    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                      <td className="px-4 py-3">
                        <Link href={routes.invoices.item(inv.id)} className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{inv.clientName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{inv.projectName ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">{inv.displayIssueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[13.5px] font-medium text-foreground/90">
                        {inv.total.toLocaleString()} {inv.currency}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={routes.invoices.edit(inv.id)} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Edit
                          </Link>
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
  const colorClass = accent === "emerald" ? "text-success" : "text-destructive";
  return (
    <div className="rounded-xl border border-border bg-card/40 px-4 py-3.5">
      <div className={`text-[22px] font-semibold leading-none mb-1.5 ${colorClass}`}>
        {value.toLocaleString()} <span className="text-[13px] font-medium">{currency}</span>
      </div>
      <div className="text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}
