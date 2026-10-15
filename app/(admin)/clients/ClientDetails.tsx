"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { updateClient, deleteClient } from "@/app/actions/clients";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  clientId: string;
  name: string;
  type: string;
  company: string;
}

const TYPE_LABELS: Record<string, string> = { COMPANY: "Company", INDIVIDUAL: "Individual" };
const fieldClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";

/** The client's name and type, shown as plain text — editing happens in a dialog, so the page itself stays a view. */
export function ClientDetails({ clientId, name, type, company }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name, type, company });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openEditor() {
    setDraft({ name, type, company });
    setError(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateClient(clientId, draft);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setOpen(false);
      // A new name gives the client a new address, so move to it.
      if (result.slug) router.replace(routes.clients.item(result.slug));
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? Jobs and payments linked to them keep their history but lose the client link. This can't be undone.`)) return;
    startTransition(async () => {
      await deleteClient(clientId);
      router.push(routes.clients.list);
    });
  }

  const subtitle = [TYPE_LABELS[type], type === "INDIVIDUAL" && company ? `works for ${company}` : null].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-none">{name}</h1>
        <p className="text-[13.5px] text-muted-foreground mt-2.5">{subtitle || "Client"}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={openEditor}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card text-foreground text-[13px] font-semibold px-4 py-2 hover:bg-muted transition-colors"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card text-destructive text-[13px] font-semibold px-4 py-2 hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientName" className={labelClass}>Name</label>
            <input id="clientName" required autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="clientType" className={labelClass}>Type</label>
            <select id="clientType" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className={fieldClass}>
              <option value="">Not set</option>
              <option value="COMPANY">Company</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
          {draft.type === "INDIVIDUAL" && (
            <div>
              <label htmlFor="clientCompany" className={labelClass}>Company they work for (optional)</label>
              <input id="clientCompany" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} className={fieldClass} />
            </div>
          )}
          {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}
          <DialogActions onCancel={() => setOpen(false)} pending={isPending} submitLabel="Save" />
        </form>
      </Modal>
    </div>
  );
}
