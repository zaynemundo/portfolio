"use client";

import { useState, useTransition } from "react";
import { deleteInvoicePayment, recordInvoicePayment } from "@/app/actions/invoices";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";

interface Payment {
  id: string;
  displayDate: string;
  amount: number;
}

interface Props {
  invoiceId: string;
  currency: string;
  total: number;
  paid: number;
  balance: number;
  payments: Payment[];
  today: string;
}

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * What has been paid on an invoice and what is left. Deposits and
 * part-payments are recorded here one at a time; the invoice turns to
 * "Paid" by itself once they cover the total.
 */
export function PaymentsPanel({ invoiceId, currency, total, paid, balance, payments, today }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function record(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await recordInvoicePayment(invoiceId, value, date);
      if (!result.ok) {
        setError(result.error ?? "The payment couldn't be recorded.");
        return;
      }
      setAmount("");
      setDialogOpen(false);
    });
  }

  function remove(payment: Payment) {
    if (!window.confirm(`Remove the ${money(payment.amount, currency)} payment from ${payment.displayDate}?`)) return;
    startTransition(() => deleteInvoicePayment(invoiceId, payment.id));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 mb-6 print:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-3">
        <h2 className="text-[13.5px] font-semibold text-foreground">Payments</h2>
        <p className="text-[12.5px] text-muted-foreground tabular-nums">
          {money(paid, currency)} paid of {money(total, currency)}
          {balance > 0 ? (
            <>
              {" · "}
              <span className="font-semibold text-foreground">{money(balance, currency)} still owed</span>
            </>
          ) : (
            <>
              {" · "}
              <span className="font-semibold text-success">Paid in full</span>
            </>
          )}
        </p>
      </div>

      {payments.length > 0 && (
        <ul className="divide-y divide-border border-y border-border mb-3">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 py-2 text-[13px]">
              <span className="text-muted-foreground w-24 shrink-0">{payment.displayDate}</span>
              <span className="flex-1 font-medium text-foreground tabular-nums">{money(payment.amount, currency)}</span>
              <button
                type="button"
                onClick={() => remove(payment)}
                disabled={isPending}
                className="text-[12.5px] font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {balance > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setDialogOpen(true);
            }}
            className="rounded-lg border border-border text-foreground/80 text-[13px] font-medium px-3.5 py-1.5 hover:bg-background transition-colors"
          >
            Record a payment
          </button>
          <button
            type="button"
            onClick={() => record(String(balance))}
            disabled={isPending}
            className="rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-3.5 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : payments.length ? "Mark the rest as paid" : "Mark as paid"}
          </button>
        </div>
      ) : (
        <p className="text-[12.5px] text-muted-foreground">To undo, remove a payment above.</p>
      )}

      {error && !dialogOpen && <p className="text-[12.5px] text-destructive mt-2" role="alert">{error}</p>}

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} title="Record a payment" maxWidthClassName="max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            record(amount);
          }}
          className="space-y-4"
        >
          <p className="text-[12.5px] text-muted-foreground">
            For a deposit or part-payment. {money(balance, currency)} is still owed on this invoice.
          </p>
          <div>
            <label htmlFor="paymentAmount" className="block text-[12px] font-medium text-foreground/80 mb-1.5">Amount ({currency})</label>
            <input
              id="paymentAmount"
              type="number"
              min="0"
              step="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(balance)}
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring"
            />
          </div>
          <div>
            <label htmlFor="paymentDate" className="block text-[12px] font-medium text-foreground/80 mb-1.5">Received on</label>
            <input
              id="paymentDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring"
            />
          </div>
          {error && <p className="text-[12.5px] text-destructive" role="alert">{error}</p>}
          <DialogActions onCancel={() => setDialogOpen(false)} pending={isPending} submitLabel="Record payment" />
        </form>
      </Modal>
    </section>
  );
}
