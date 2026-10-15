"use client";

import { useState, useTransition } from "react";
import { DateField } from "@/app/(admin)/_components/ui/DateField";
import { useRouter } from "next/navigation";
import { createInvoice, updateInvoice, type InvoiceFormData, type InvoiceItemInput } from "@/app/actions/invoices";
import { ClientSelect, type ClientOption } from "@/app/(admin)/_components/ClientSelect";
import { Select } from "@/app/(admin)/_components/Select";
import { routes } from "@/app/(admin)/_routes";
import { cardClass } from "@/app/(admin)/_components/ui/Card";

interface Option {
  id: string;
  name: string;
  /** The job's rate, so an hourly invoice can start from it. */
  rateType?: string | null;
  rateAmount?: number | null;
  rateCurrency?: string | null;
}

/** The job's rate type, as the invoice's billing type. */
const BILLING_FOR_RATE: Record<string, string> = { FIXED: "PROJECT", HOURLY: "HOURLY", RETAINER: "MONTHLY" };

interface Props {
  mode: "new" | "edit";
  invoiceId?: string;
  initial?: Partial<InvoiceFormData>;
  clients: ClientOption[];
  onClientCreated?: (client: ClientOption) => void;
  projects: Option[];
  onSuccess?: () => void;
}

function emptyItem(): InvoiceItemInput {
  return { description: "", quantity: "1", rate: "" };
}

export function InvoiceForm({ mode, invoiceId, initial, clients, onClientCreated, projects, onSuccess }: Props) {
  const router = useRouter();
  const kind = initial?.kind === "QUOTE" ? "QUOTE" : "INVOICE";
  const isQuote = kind === "QUOTE";
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "AED");
  const [discount, setDiscount] = useState(initial?.discount ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<InvoiceItemInput[]>(initial?.items && initial.items.length > 0 ? initial.items : [emptyItem()]);
  const jobOf = (id: string) => projects.find((p) => p.id === id);
  const [billing, setBilling] = useState(
    initial?.billing ?? BILLING_FOR_RATE[jobOf(initial?.projectId ?? "")?.rateType ?? ""] ?? "PROJECT",
  );
  const [repeats, setRepeats] = useState(initial?.repeats ?? true);
  const [repeatUntil, setRepeatUntil] = useState(initial?.repeatUntil ?? "");
  const hourly = billing === "HOURLY";
  const billingOptions = isQuote ? BILLING_OPTIONS.filter((b) => b.value !== "MONTHLY") : BILLING_OPTIONS;

  /** Picking a job sets the billing type from its rate (on a new document), and an hourly rate for empty lines. */
  function chooseJob(id: string) {
    setProjectId(id);
    const job = jobOf(id);
    if (!job || mode !== "new") return;
    const next = BILLING_FOR_RATE[job.rateType ?? ""];
    if (next && (!isQuote || next !== "MONTHLY")) changeBilling(next, job);
  }

  function changeBilling(next: string, job = jobOf(projectId)) {
    setBilling(next);
    setItems((prev) =>
      prev.map((it) => {
        // Project and monthly lines are one price each; hourly lines start with an hour at the job's rate.
        if (next !== "HOURLY") return Number(it.quantity) === 1 ? it : { ...it, quantity: "1" };
        const rate = it.rate || (job?.rateType === "HOURLY" && job.rateAmount ? String(job.rateAmount) : "");
        return { ...it, rate };
      }),
    );
  }
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateItem(i: number, patch: Partial<InvoiceItemInput>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  const subtotal = items.reduce((sum, it) => {
    const q = Number(it.quantity) || 0;
    const r = Number(it.rate) || 0;
    return sum + q * r;
  }, 0);
  const discountValue = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const total = subtotal - discountValue;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: InvoiceFormData = { kind, clientId, projectId, status, issueDate, dueDate, currency, discount, notes, items, billing, repeats, repeatUntil };

    startTransition(async () => {
      const result = mode === "new"
        ? await createInvoice(data)
        : await updateInvoice(invoiceId!, data);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (onSuccess) {
        onSuccess();
        return;
      }
      if (result.id) router.push(routes.invoices.item(result.id));
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} p-5 space-y-5`}>
      {/* How this one is billed: decides the line columns, and whether it repeats. */}
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-1.5">Billing</span>
        <div className="inline-flex rounded-full border border-border bg-background p-0.5" role="radiogroup" aria-label="Billing">
          {billingOptions.map((b) => (
            <button
              key={b.value}
              type="button"
              role="radio"
              aria-checked={billing === b.value}
              onClick={() => changeBilling(b.value)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                billing === b.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground">{billingOptions.find((b) => b.value === billing)?.hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Client (optional)</label>
          <ClientSelect value={clientId} onChange={setClientId} clients={clients} onClientCreated={onClientCreated} className={selectClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Job (optional)</label>
          <Select
            value={projectId}
            onChange={chooseJob}
            className={selectClass}
            options={[{ value: "", label: "—" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
          <Select
            value={status}
            onChange={setStatus}
            className={selectClass}
            options={
              isQuote
                ? [
                    { value: "DRAFT", label: "Draft" },
                    { value: "SENT", label: "Sent" },
                    { value: "ACCEPTED", label: "Accepted" },
                    { value: "DECLINED", label: "Declined" },
                  ]
                : [
                    { value: "DRAFT", label: "Draft" },
                    { value: "SENT", label: "Sent" },
                    { value: "PAID", label: "Paid" },
                    { value: "OVERDUE", label: "Overdue" },
                  ]
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Issue date</label>
          <DateField required value={issueDate} onChange={setIssueDate} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">{isQuote ? "Valid until" : "Due date"}</label>
          <DateField value={dueDate} onChange={setDueDate} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Currency</label>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="AED" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Line items</label>
        {/* Project and monthly: one price per line. Hourly: hours × rate, with the line's amount worked out. */}
        <div className={`${hourly ? HOURLY_GRID : LINE_GRID} mb-1.5 px-0.5 text-[11.5px] font-medium text-muted-foreground`} aria-hidden>
          <span>Description</span>
          {hourly && <span className="text-right">Hours</span>}
          {hourly && <span className="text-right">Rate</span>}
          <span className="text-right">Amount</span>
          <span />
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className={`${hourly ? HOURLY_GRID : LINE_GRID} items-center`}>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder={hourly ? "e.g. Homepage fixes" : billing === "MONTHLY" ? "e.g. Website care, monthly" : "What the work was"}
                aria-label={`Line ${i + 1} description`}
                className={inputClass}
              />
              {hourly ? (
                <>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                    placeholder="0"
                    aria-label={`Line ${i + 1} hours`}
                    className={`${inputClass} px-2.5 text-right`}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(i, { rate: e.target.value })}
                    placeholder="0"
                    aria-label={`Line ${i + 1} hourly rate`}
                    className={`${inputClass} px-2.5 text-right`}
                  />
                  <span className="truncate text-right text-[13.5px] tabular-nums text-foreground/90">
                    {((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(i, { rate: e.target.value })}
                    placeholder="0"
                    aria-label={`Line ${i + 1} amount`}
                    className={`${inputClass} px-2.5 text-right`}
                  />
                  {Number(item.quantity) !== 1 && item.quantity !== "" && (
                    <span className="absolute -bottom-4 right-1 text-[10.5px] text-muted-foreground">× {item.quantity}</span>
                  )}
                </span>
              )}
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={items.length === 1}
                aria-label="Remove item"
                className="shrink-0 h-9 w-9 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-30 flex items-center justify-center text-[15px]"
              >
                −
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="mt-2 w-full rounded-lg border border-dashed border-border text-muted-foreground text-[12.5px] font-medium py-2 hover:bg-card hover:text-foreground/90 transition-colors"
        >
          + Add line item
        </button>

        <div className="flex justify-end mt-4">
          <dl className="w-full max-w-[300px] space-y-2 text-[13.5px] tabular-nums">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground/90">{subtotal.toLocaleString()} {currency}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt><label htmlFor="discount" className="text-muted-foreground">Discount</label></dt>
              <dd className="w-32">
                <input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className={`${inputClass} py-1.5 text-right`}
                />
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="font-semibold text-foreground">{total.toLocaleString()} {currency}</dd>
            </div>
          </dl>
        </div>
      </div>

      {billing === "MONTHLY" && !isQuote && (
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="flex items-center gap-2.5 text-[13.5px] font-medium text-foreground">
            <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} className="h-4 w-4 rounded border-border" />
            Repeat every month
          </label>
          {repeats && (
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                This invoice is the first month. On day {Number(issueDate.slice(8, 10)) || 1} of each month after, a draft copy is made
                with the next number and that month&rsquo;s dates, ready for you to check and send. Nothing is sent by itself.
              </p>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Last month (optional)</label>
                <DateField value={repeatUntil} onChange={setRepeatUntil} placeholder="Keeps going" className={inputClass} />
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (optional)</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "new" ? (isQuote ? "Create quote" : "Create invoice") : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const LINE_GRID = "grid grid-cols-[minmax(0,1fr)_140px_36px] gap-2";
const HOURLY_GRID = "grid grid-cols-[minmax(0,1fr)_80px_112px_96px_36px] gap-2";

const BILLING_OPTIONS = [
  { value: "PROJECT", label: "Project", hint: "A price for each piece of work." },
  { value: "HOURLY", label: "Hourly", hint: "Hours × your hourly rate, line by line." },
  { value: "MONTHLY", label: "Monthly", hint: "A retainer: a fresh draft of this invoice is made every month." },
];
const inputClass = "w-full rounded-lg bg-card border border-border px-3.5 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-ring transition-colors";
const selectClass = `${inputClass} flex items-center justify-between gap-2`;
