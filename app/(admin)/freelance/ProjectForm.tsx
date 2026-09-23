"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFreelanceProject, updateFreelanceProject, type FreelanceProjectFormData } from "@/app/actions/freelance";

interface Props {
  mode: "new" | "edit";
  projectId?: string;
  initial?: Partial<FreelanceProjectFormData>;
}

export function ProjectForm({ mode, projectId, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [status, setStatus] = useState(initial?.status ?? "NOT_STARTED");
  const [rate, setRate] = useState(initial?.rate ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: FreelanceProjectFormData = { name, client, status, description, rate, deadline };

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
          <input id="client" value={client} onChange={(e) => setClient(e.target.value)} className={inputClass} />
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="rate" className="block text-xs font-medium text-zinc-400 mb-1.5">Rate (optional)</label>
          <input id="rate" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. AED 8,000 fixed" className={inputClass} />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-xs font-medium text-zinc-400 mb-1.5">Deadline (optional)</label>
          <input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-zinc-400 mb-1.5">Notes / description</label>
        <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
      </div>

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
