"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoice, updateInvoice, type InvoiceFormData, type InvoiceItemInput } from "@/app/actions/invoices";
import { ClientSelect, type ClientOption } from "@/app/(admin)/_components/ClientSelect";
import { Select } from "@/app/(admin)/_components/Select";
import { routes } from "@/app/(admin)/_routes";

interface Option {
  id: string;
  name: string;
}

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
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "AED");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<InvoiceItemInput[]>(initial?.items && initial.items.length > 0 ? initial.items : [emptyItem()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateItem(i: number, patch: Partial<InvoiceItemInput>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  const total = items.reduce((sum, it) => {
    const q = Number(it.quantity) || 0;
    const r = Number(it.rate) || 0;
    return sum + q * r;
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: InvoiceFormData = { clientId, projectId, status, issueDate, dueDate, currency, notes, items };

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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Client (optional)</label>
          <ClientSelect value={clientId} onChange={setClientId} clients={clients} onClientCreated={onClientCreated} className={selectClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Project (optional)</label>
          <Select
            value={projectId}
            onChange={setProjectId}
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
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "SENT", label: "Sent" },
              { value: "PAID", label: "Paid" },
              { value: "OVERDUE", label: "Overdue" },
            ]}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Issue date</label>
          <input type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Due date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Currency</label>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="AED" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Line items</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Description"
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: e.target.value })}
                placeholder="Qty"
                className={`${inputClass} w-20`}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => updateItem(i, { rate: e.target.value })}
                placeholder="Rate"
                className={`${inputClass} w-28`}
              />
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

        <div className="flex justify-end mt-3 text-[14px] text-foreground/90">
          <span className="text-muted-foreground mr-2">Total:</span>
          <span className="font-semibold">{total.toLocaleString()} {currency}</span>
        </div>
      </div>

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
          {isPending ? "Saving…" : mode === "new" ? "Create invoice" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-lg bg-card border border-border px-3.5 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-ring transition-colors";
const selectClass = `${inputClass} flex items-center justify-between gap-2`;
