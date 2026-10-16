"use client";

import { useState, useTransition } from "react";
import { DateField } from "@/app/(admin)/_components/ui/DateField";
import { useRouter } from "next/navigation";
import { createTransaction, updateTransaction, uploadTransactionAttachment, type TransactionFormData } from "@/app/actions/finance";
import { ClientSelect, type ClientOption } from "@/app/(admin)/_components/ClientSelect";
import { Select } from "@/app/(admin)/_components/Select";
import { UploadCard } from "@/app/(admin)/_components/UploadCard";
import { routes } from "@/app/(admin)/_routes";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { RequiredMark } from "@/app/(admin)/_components/Section";

interface Option {
  id: string;
  name: string;
}

interface Props {
  mode: "new" | "edit";
  transactionId?: string;
  initial?: Partial<TransactionFormData>;
  clients: ClientOption[];
  onClientCreated?: (client: ClientOption) => void;
  projects: Option[];
  onSuccess?: () => void;
}

export function TransactionForm({ mode, transactionId, initial, clients, onClientCreated, projects, onSuccess }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [type, setType] = useState(initial?.type ?? "INCOME");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "AED");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(initial?.attachmentUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: TransactionFormData = { date, type, amount, currency, category, description, clientId, projectId, attachmentUrl };

    startTransition(async () => {
      const result = mode === "new"
        ? await createTransaction(data)
        : await updateTransaction(transactionId!, data);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (onSuccess) {
        onSuccess();
        return;
      }
      if (mode === "new" && result.id) router.push(routes.finance.item(result.id));
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} p-5 space-y-5`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-xs font-medium text-muted-foreground mb-1.5">Type</label>
          <Select
            value={type}
            onChange={setType}
            className={selectClass}
            options={[
              { value: "INCOME", label: "Income" },
              { value: "EXPENSE", label: "Expense" },
            ]}
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-xs font-medium text-muted-foreground mb-1.5">Date<RequiredMark /></label>
          <DateField id="date" required value={date} onChange={setDate} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-muted-foreground mb-1.5">Amount<RequiredMark /></label>
          <input id="amount" type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="currency" className="block text-xs font-medium text-muted-foreground mb-1.5">Currency</label>
          <input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="AED" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-xs font-medium text-muted-foreground mb-1.5">Category (optional)</label>
        <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Design work, Software, Travel" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clientId" className="block text-xs font-medium text-muted-foreground mb-1.5">Client (optional)</label>
          <ClientSelect value={clientId} onChange={setClientId} clients={clients} onClientCreated={onClientCreated} className={selectClass} />
        </div>
        <div>
          <label htmlFor="projectId" className="block text-xs font-medium text-muted-foreground mb-1.5">Project (optional)</label>
          <Select
            value={projectId}
            onChange={setProjectId}
            className={selectClass}
            options={[{ value: "", label: "—" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-muted-foreground mb-1.5">Description (optional)</label>
        <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

      <UploadCard
        title="Receipt / proof (optional)"
        description="Evidence for this transaction — receipt for an expense, proof of payment for income. PDF or image up to 15MB."
        currentUrl={attachmentUrl}
        accept="*/*"
        kind="file"
        uploadAction={async (formData) => {
          const result = await uploadTransactionAttachment(formData);
          if (result.ok && result.url) setAttachmentUrl(result.url);
          return result;
        }}
      />

      {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "new" ? "Add transaction" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-lg bg-card border border-border px-3.5 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-ring transition-colors";
const selectClass = `${inputClass} flex items-center justify-between gap-2`;
