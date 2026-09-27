"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createFreelanceProject,
  updateFreelanceProject,
  deleteFreelanceProject,
  archiveFreelanceProject,
  uploadFreelanceAttachment,
  type FreelanceProjectFormData,
} from "@/app/actions/freelance";
import { UploadCard } from "@/app/(admin)/_components/UploadCard";
import { ClientSelect, type ClientOption } from "@/app/(admin)/_components/ClientSelect";
import { Select } from "@/app/(admin)/_components/Select";
import { routes } from "@/app/(admin)/_routes";

const SELECT_CLASS = "w-full flex items-center justify-between gap-2 rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 hover:bg-zinc-800 transition-colors";

interface Props {
  projectId?: string;
  initial?: Partial<FreelanceProjectFormData> & { archived?: boolean };
  clients: ClientOption[];
  onClientCreated?: (client: ClientOption) => void;
  /** Called after the project is deleted, so the parent can e.g. navigate away. */
  onDeleted?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Apple-Notes-style: no separate edit mode, no Save button — every change autosaves. */
export function ProjectForm({ projectId, initial, clients, onClientCreated, onDeleted }: Props) {
  const router = useRouter();
  const [id, setId] = useState(projectId ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "NOT_STARTED");
  const [rateAmount, setRateAmount] = useState(initial?.rateAmount ?? "");
  const [rateCurrency, setRateCurrency] = useState(initial?.rateCurrency ?? "AED");
  const [rateType, setRateType] = useState(initial?.rateType ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(initial?.attachmentUrl ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [archived, setArchived] = useState(initial?.archived ?? false);
  const [saveStatus, setStatusMsg] = useState<SaveStatus>("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  const isFirstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!name.trim()) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setStatusMsg("saving");
      const data: FreelanceProjectFormData = {
        name, clientId, status, description, rateAmount, rateCurrency, rateType, attachmentUrl, deadline,
      };
      const result = id ? await updateFreelanceProject(id, data) : await createFreelanceProject(data);
      if (!result.ok) {
        setStatusMsg("error");
        return;
      }
      if (!id && result.id) {
        setId(result.id);
        router.replace(routes.projects.item(result.id));
      }
      setStatusMsg("saved");
      router.refresh();
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, clientId, status, rateAmount, rateCurrency, rateType, attachmentUrl, deadline, description]);

  function toggleArchive() {
    if (!id) return;
    const next = !archived;
    setArchived(next);
    archiveFreelanceProject(id, next).then(() => router.refresh());
  }

  function handleDelete() {
    if (!id) return;
    if (!window.confirm(`Delete "${name}" and all its tasks? This can't be undone.`)) return;
    setIsDeleting(true);
    deleteFreelanceProject(id).then(() => {
      if (onDeleted) onDeleted();
      else router.push(routes.projects.list);
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          style={{ outline: "none" }}
          className="w-full text-[21px] font-semibold text-zinc-100 placeholder:text-zinc-600 bg-transparent"
        />
        {id && (
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <button
              type="button"
              onClick={toggleArchive}
              aria-label={archived ? "Unarchive" : "Archive"}
              title={archived ? "Unarchive" : "Archive"}
              className={`h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800/60 transition-colors ${
                archived ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              <ArchiveIcon />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete project"
              title="Delete project"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800/60 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-zinc-600 mb-1">Client</label>
          <ClientSelect
            value={clientId}
            onChange={setClientId}
            clients={clients}
            onClientCreated={onClientCreated}
            className={SELECT_CLASS}
          />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-600 mb-1">Status</label>
          <Select
            value={status}
            onChange={setStatus}
            className={SELECT_CLASS}
            options={[
              { value: "NOT_STARTED", label: "Not started" },
              { value: "ACTIVE", label: "Active" },
              { value: "ON_HOLD", label: "On hold" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[11px] text-zinc-600 mb-1">Rate (optional)</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={rateAmount}
            onChange={(e) => setRateAmount(e.target.value)}
            placeholder="Amount"
            style={{ outline: "none" }}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 placeholder:text-zinc-600"
          />
          <input
            value={rateCurrency}
            onChange={(e) => setRateCurrency(e.target.value)}
            placeholder="AED"
            style={{ outline: "none" }}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 placeholder:text-zinc-600"
          />
          <Select
            value={rateType}
            onChange={setRateType}
            className={SELECT_CLASS}
            placeholder="Type…"
            options={[
              { value: "FIXED", label: "Fixed" },
              { value: "HOURLY", label: "Hourly" },
              { value: "RETAINER", label: "Retainer" },
            ]}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] text-zinc-600 mb-1">Deadline (optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ outline: "none" }}
          className="rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200"
        />
      </div>

      <textarea
        rows={5}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Notes / description…"
        style={{ outline: "none" }}
        className="w-full bg-transparent text-[14.5px] text-zinc-200 placeholder:text-zinc-600 resize-none mb-4"
      />

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

      <p className="text-[11.5px] text-zinc-600 mt-3">
        {saveStatus === "saving" && "Saving…"}
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "error" && <span className="text-red-400">Couldn&apos;t save — check your connection.</span>}
      </p>
    </div>
  );
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 7.5V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.2 10.5h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.482l-.78 9.36A2 2 0 0 1 11.995 17.7H8.005a2 2 0 0 1-1.993-1.84l-.78-9.36H4.75a.75.75 0 0 1 0-1.5H8v-.5Zm1.5.5h1V5h-1v-0Zm-2.223 1.5.766 9.24a.5.5 0 0 0 .498.46h3.99a.5.5 0 0 0 .498-.46l.766-9.24H7.277Z" />
    </svg>
  );
}
