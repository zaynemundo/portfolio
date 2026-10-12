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

type Tab = "transactions" | "invoices" | "quotes";

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
  isQuote: boolean;
  invoiceNumber: string;
  status: string;
  displayIssueDate: string;
  currency: string;
  total: number;
  /** What is still owed after payments; equal to the total for quotes. */
  balance: number;
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
  quotes: InvoiceRow[];
  clients: ClientOption[];
  projects: Option[];
  initialTab: Tab;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-secondary text-muted-foreground",
  SENT: "bg-blue-500/15 text-blue-400",
  PAID: "bg-success/15 text-success",
  OVERDUE: "bg-destructive/15 text-destructive",
  ACCEPTED: "bg-success/15 text-success",
  DECLINED: "bg-secondary text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

/** Cross-client, cross-project income/expense/invoices view — the deliberately
 *  global finance picture. Invoices also live on each Freelance Project's own
 *  page (since each project has its own invoices), but the full set belongs
 *  here too — this is "our finance". */
export function FinanceTabs({ month, transactions, income, expense, net, currency, invoices, quotes, clients: initialClients, projects, initialTab }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
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
          <p className="text-[13px] text-muted-foreground">Quotes, invoices, income and expenses across every client and job.</p>
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
            href={tab === "quotes" ? `${routes.invoices.new}?kind=quote` : routes.invoices.new}
            className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            {tab === "quotes" ? "+ New quote" : "+ New invoice"}
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {(
          [
            { id: "quotes", label: "Quotes", count: quotes.length },
            { id: "invoices", label: "Invoices", count: invoices.length },
            { id: "transactions", label: "Income & expenses", count: null },
          ] as { id: Tab; label: string; count: number | null }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {t.label}
            {t.count !== null && t.count > 0 && <span className="ml-1.5 text-muted-foreground tabular-nums">{t.count}</span>}
          </button>
        ))}
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
        <DocumentTable rows={invoices} empty="No invoices yet." onDeleted={() => router.refresh()} />
      )}

      {tab === "quotes" && (
        <DocumentTable
          rows={quotes}
          empty="No quotes yet. A quote becomes an invoice in one click once the client accepts it."
          onDeleted={() => router.refresh()}
        />
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

/** The list behind the Quotes and Invoices tabs — same columns, same actions. */
function DocumentTable({ rows, empty, onDeleted }: { rows: InvoiceRow[]; empty: string; onDeleted: () => void }) {
  if (rows.length === 0) return <EmptyState message={empty} />;

  return (
    <div className="border border-border rounded-xl overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border bg-card/50">
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Number</th>
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Client</th>
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Job</th>
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Issued</th>
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
            <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const partPaid = !row.isQuote && row.balance > 0 && row.balance < row.total;
            return (
              <tr key={row.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                <td className="px-4 py-3">
                  <Link href={routes.invoices.item(row.id)} className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors">
                    {row.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{row.clientName ?? "—"}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{row.projectName ?? "—"}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">{row.displayIssueDate}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[row.status] ?? STATUS_STYLES.DRAFT}`}>
                    {STATUS_LABELS[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="text-[13.5px] font-medium text-foreground/90">
                    {row.total.toLocaleString()} {row.currency}
                  </span>
                  {partPaid && (
                    <span className="block text-[11.5px] text-muted-foreground">{row.balance.toLocaleString()} still owed</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={routes.invoices.edit(row.id)} className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Edit
                    </Link>
                    <DeleteInvoiceButton id={row.id} number={row.invoiceNumber} onDeleted={onDeleted} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
