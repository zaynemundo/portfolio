"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient, type ClientFormData } from "@/app/actions/clients";
import { Select } from "@/app/(admin)/_components/Select";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  mode: "new" | "edit";
  clientId?: string;
  initial?: Partial<ClientFormData>;
  onSuccess?: () => void;
}

export function ClientForm({ mode, clientId, initial, onSuccess }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ClientFormData = { name, type, email, phone, company, notes };

    startTransition(async () => {
      const result = mode === "new"
        ? await createClient(data)
        : await updateClient(clientId!, data);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (onSuccess) {
        onSuccess();
        return;
      }
      if (mode === "new" && result.id) router.push(routes.clients.item(result.id));
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-[1fr_160px] gap-4">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-zinc-400 mb-1.5">Name</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Type</label>
          <Select
            value={type}
            onChange={setType}
            className={selectClass}
            placeholder="—"
            options={[
              { value: "COMPANY", label: "Company" },
              { value: "INDIVIDUAL", label: "Individual" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">Email (optional)</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-zinc-400 mb-1.5">Phone (optional)</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-xs font-medium text-zinc-400 mb-1.5">Company (optional)</label>
        <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-zinc-400 mb-1.5">Notes (optional)</label>
        <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-5 py-2.5 hover:bg-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : mode === "new" ? "Add client" : "Save changes"}
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors";
const selectClass = `${inputClass} flex items-center justify-between gap-2`;
