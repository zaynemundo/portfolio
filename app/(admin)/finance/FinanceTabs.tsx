"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { routes } from "@/app/(admin)/_routes";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { Modal } from "@/app/(admin)/_components/Modal";
import { MonthFilter } from "./MonthFilter";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import { DeleteInvoiceButton } from "../invoices/DeleteInvoiceButton";
import { TransactionForm } from "./TransactionForm";
import type { TransactionFormData } from "@/app/actions/finance";
import type { ClientOption } from "@/app/(admin)/_components/ClientSelect";
import { InvoiceStatusPill, INVOICE_STATUS } from "@/app/(admin)/_components/ui/StatusPill";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { cardClass, tabBarClass, tabClass } from "@/app/(admin)/_components/ui/Card";

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
  /** yyyy-mm-dd, for sorting. */
  issueDate: string;
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

      <div className={tabBarClass} role="tablist">
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
            role="tab"
            aria-selected={tab === t.id}
            className={tabClass(tab === t.id)}
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
            <div className={`${cardClass} p-5`}>
            <DataTable
              inset={false}
              toolbar="always"
              searchPlaceholder="Search by description, client or category…"
              filters={[{ key: "type", label: "Type", options: [{ value: "INCOME", label: "Income" }, { value: "EXPENSE", label: "Expenses" }] }]}
              columns={[{ label: "Date" }, { label: "Description" }, { label: "Client" }, { label: "Category" }, { label: "Amount", align: "right" }, { className: "w-12" }]}
              rows={transactions.map((t) => ({
                id: t.id,
                onClick: () => setTxModal(t),
                search: `${t.description} ${t.category} ${t.clientName ?? ""}`,
                sort: [t.date, t.description || t.category || null, t.clientName, t.category || null, (t.type === "INCOME" ? 1 : -1) * Number(t.amount), undefined],
                filters: { type: t.type },
                cells: (
                  <>
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
                        <RowMenu>
                          <RowMenuItem onClick={() => setTxModal(t)} icon={<Pencil size={14} />}>
                            Edit
                          </RowMenuItem>
                          <DeleteTransactionButton id={t.id} onDeleted={() => router.refresh()} menu />
                        </RowMenu>
                      </td>
                  </>
                ),
              }))}
            />
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
    <div className="rounded-xl border border-border bg-card shadow-xs px-4 py-3.5">
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
  // Only the statuses that actually occur, in their usual order.
  const statusOptions = Object.keys(INVOICE_STATUS)
    .filter((status) => rows.some((row) => row.status === status))
    .map((status) => ({ value: status, label: INVOICE_STATUS[status].label }));

  return (
    <div className={`${cardClass} p-5`}>
      <DataTable
        inset={false}
        toolbar="always"
        tableClassName="min-w-[720px]"
        searchPlaceholder="Search by number, client or job…"
        filters={[{ key: "status", label: "Status", options: statusOptions }]}
        columns={[{ label: "Number" }, { label: "Client" }, { label: "Job" }, { label: "Issued" }, { label: "Status" }, { label: "Total", align: "right" }, { className: "w-12" }]}
        rows={rows.map((row) => {
          const partPaid = !row.isQuote && row.balance > 0 && row.balance < row.total;
          return {
            id: row.id,
            href: routes.invoices.item(row.id),
            search: `${row.invoiceNumber} ${row.clientName ?? ""} ${row.projectName ?? ""}`,
            sort: [row.invoiceNumber, row.clientName, row.projectName, row.issueDate, INVOICE_STATUS[row.status]?.label ?? row.status, row.total, undefined],
            filters: { status: row.status },
            cells: (
              <>
                <td className="px-4 py-3">
                  <Link href={routes.invoices.item(row.id)} className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors">
                    {row.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{row.clientName ?? "—"}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{row.projectName ?? "—"}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">{row.displayIssueDate}</td>
                <td className="px-4 py-3">
                  <InvoiceStatusPill status={row.status} />
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
                  <RowMenu>
                    <RowMenuItem href={routes.invoices.edit(row.id)} icon={<Pencil size={14} />}>
                      Edit
                    </RowMenuItem>
                    <DeleteInvoiceButton id={row.id} number={row.invoiceNumber} onDeleted={onDeleted} menu />
                  </RowMenu>
                </td>
              </>
            ),
          };
        })}
      />
    </div>
  );
}
