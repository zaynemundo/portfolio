"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, updateTransaction, type TransactionFormData } from "@/app/actions/finance";

interface Option {
  id: string;
  name: string;
}

interface Props {
  mode: "new" | "edit";
  transactionId?: string;
  initial?: Partial<TransactionFormData>;
  clients: Option[];
  projects: Option[];
}

export function TransactionForm({ mode, transactionId, initial, clients, projects }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [type, setType] = useState(initial?.type ?? "INCOME");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "AED");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: TransactionFormData = { date, type, amount, currency, category, description, clientId, projectId };

    startTransition(async () => {
      const result = mode === "new"
        ? await createTransaction(data)
        : await updateTransaction(transactionId!, data);
      if (result && !result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (mode === "edit") router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-xs font-medium text-zinc-400 mb-1.5">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-xs font-medium text-zinc-400 mb-1.5">Date</label>
          <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-zinc-400 mb-1.5">Amount</label>
          <input id="amount" type="number" min="0" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="currency" className="block text-xs font-medium text-zinc-400 mb-1.5">Currency</label>
          <input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="AED" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-xs font-medium text-zinc-400 mb-1.5">Category (optional)</label>
        <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Design work, Software, Travel" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clientId" className="block text-xs font-medium text-zinc-400 mb-1.5">Client (optional)</label>
          <select id="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="projectId" className="block text-xs font-medium text-zinc-400 mb-1.5">Project (optional)</label>
          <select id="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-zinc-400 mb-1.5">Description (optional)</label>
        <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-5 py-2.5 hover:bg-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : mode === "new" ? "Add transaction" : "Save changes"}
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors";
