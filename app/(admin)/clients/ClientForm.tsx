"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient, deleteClient, type ClientFormData } from "@/app/actions/clients";
import { Select } from "@/app/(admin)/_components/Select";
import { routes } from "@/app/(admin)/_routes";

const SELECT_CLASS = "w-full flex items-center justify-between gap-2 rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 hover:bg-zinc-800 transition-colors";

interface Props {
  clientId?: string;
  initial?: Partial<ClientFormData>;
  /** Called after the client is deleted, so the parent can e.g. navigate away. */
  onDeleted?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Apple-Notes-style: no separate edit mode, no Save button — every change autosaves. */
export function ClientForm({ clientId, initial, onDeleted }: Props) {
  const router = useRouter();
  const [id, setId] = useState(clientId ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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
      setSaveStatus("saving");
      const data: ClientFormData = { name, type, email, phone, company, notes };
      const result = id ? await updateClient(id, data) : await createClient(data);
      if (!result.ok) {
        setSaveStatus("error");
        return;
      }
      if (!id && result.id) {
        setId(result.id);
        router.replace(routes.clients.item(result.id));
      }
      setSaveStatus("saved");
      router.refresh();
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, type, email, phone, company, notes]);

  function handleDelete() {
    if (!id) return;
    if (!window.confirm(`Delete "${name}"? Projects and transactions linked to them keep their history but lose the client link. This can't be undone.`)) return;
    setIsDeleting(true);
    deleteClient(id).then(() => {
      if (onDeleted) onDeleted();
      else router.push(routes.clients.list);
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          style={{ outline: "none" }}
          className="w-full text-[21px] font-semibold text-zinc-100 placeholder:text-zinc-600 bg-transparent"
        />
        {id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete client"
            title="Delete client"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800/60 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0 mt-0.5"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="mb-3">
        <label className="block text-[11px] text-zinc-600 mb-1">Type (optional)</label>
        <Select
          value={type}
          onChange={setType}
          className={SELECT_CLASS}
          placeholder="—"
          options={[
            { value: "COMPANY", label: "Company" },
            { value: "INDIVIDUAL", label: "Individual" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-zinc-600 mb-1">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-600 mb-1">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] text-zinc-600 mb-1">Company (optional)</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{ outline: "none" }}
          className="w-full rounded-lg bg-zinc-800/60 px-3 py-2 text-[13.5px] text-zinc-200 placeholder:text-zinc-600"
        />
      </div>

      <textarea
        rows={5}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes…"
        style={{ outline: "none" }}
        className="w-full bg-transparent text-[14.5px] text-zinc-200 placeholder:text-zinc-600 resize-none mb-3"
      />

      <p className="text-[11.5px] text-zinc-600">
        {saveStatus === "saving" && "Saving…"}
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "error" && <span className="text-red-400">Couldn&apos;t save — check your connection.</span>}
      </p>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.482l-.78 9.36A2 2 0 0 1 11.995 17.7H8.005a2 2 0 0 1-1.993-1.84l-.78-9.36H4.75a.75.75 0 0 1 0-1.5H8v-.5Zm1.5.5h1V5h-1v-0Zm-2.223 1.5.766 9.24a.5.5 0 0 0 .498.46h3.99a.5.5 0 0 0 .498-.46l.766-9.24H7.277Z" />
    </svg>
  );
}
