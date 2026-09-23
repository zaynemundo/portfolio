"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFreelanceProject, updateFreelanceProject, uploadFreelanceAttachment, type FreelanceProjectFormData } from "@/app/actions/freelance";
import { UploadCard } from "@/app/(admin)/_components/UploadCard";

interface ClientOption {
  id: string;
  name: string;
}

interface Props {
  mode: "new" | "edit";
  projectId?: string;
  initial?: Partial<FreelanceProjectFormData>;
  clients: ClientOption[];
}

export function ProjectForm({ mode, projectId, initial, clients }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "NOT_STARTED");
  const [rateAmount, setRateAmount] = useState(initial?.rateAmount ?? "");
  const [rateCurrency, setRateCurrency] = useState(initial?.rateCurrency ?? "AED");
  const [rateType, setRateType] = useState(initial?.rateType ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(initial?.attachmentUrl ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: FreelanceProjectFormData = {
      name, clientId, status, description, rateAmount, rateCurrency, rateType, attachmentUrl, deadline,
    };

    startTransition(async () => {
      const result = mode === "new"
        ? await createFreelanceProject(data)
        : await updateFreelanceProject(projectId!, data);
      if (result && !result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (mode === "edit") router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-zinc-400 mb-1.5">Project name</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="client" className="block text-xs font-medium text-zinc-400 mb-1.5">Client (optional)</label>
          <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-zinc-400 mb-1.5">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="NOT_STARTED">Not started</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Rate (optional)</label>
        <div className="grid grid-cols-3 gap-3">
          <input type="number" min="0" step="0.01" value={rateAmount} onChange={(e) => setRateAmount(e.target.value)} placeholder="Amount" className={inputClass} />
          <input value={rateCurrency} onChange={(e) => setRateCurrency(e.target.value)} placeholder="AED" className={inputClass} />
          <select value={rateType} onChange={(e) => setRateType(e.target.value)} className={inputClass}>
            <option value="">Type…</option>
            <option value="FIXED">Fixed</option>
            <option value="HOURLY">Hourly</option>
            <option value="RETAINER">Retainer</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="deadline" className="block text-xs font-medium text-zinc-400 mb-1.5">Deadline (optional)</label>
        <input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-zinc-400 mb-1.5">Notes / description</label>
        <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

      <UploadCard
        title="Contract / invoice / deliverable"
        description="PDF, image, or any file up to 15MB"
        currentUrl={attachmentUrl}
        accept="*/*"
        kind="file"
        uploadAction={async (formData) => {
          const result = await uploadFreelanceAttachment(formData);
          if (result.ok && result.url) setAttachmentUrl(result.url);
          return result;
        }}
      />

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-5 py-2.5 hover:bg-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : mode === "new" ? "Create project" : "Save changes"}
      </button>
    </form>
  );
}

const inputClass = "w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors";
