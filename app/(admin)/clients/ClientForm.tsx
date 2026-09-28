"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient, deleteClient, type ClientFormData } from "@/app/actions/clients";
import { Select } from "@/app/(admin)/_components/Select";
import { routes } from "@/app/(admin)/_routes";

const SELECT_CLASS = "w-full flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 hover:bg-secondary transition-colors";

interface Props {
  clientId?: string;
  initial?: Partial<ClientFormData>;
  /** Called after the client is deleted, so the parent can e.g. navigate away. */
  onDeleted?: () => void;
}

export function ClientForm({ clientId, initial, onDeleted }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ClientFormData = { name, type, email, phone, company };

    startTransition(async () => {
      const result = clientId ? await updateClient(clientId, data) : await createClient(data);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (!clientId && result.id) router.push(routes.clients.item(result.id));
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!clientId) return;
    if (!window.confirm(`Delete "${name}"? Projects and transactions linked to them keep their history but lose the client link. This can't be undone.`)) return;
    setIsDeleting(true);
    deleteClient(clientId).then(() => {
      if (onDeleted) onDeleted();
      else router.push(routes.clients.list);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          required
          style={{ outline: "none" }}
          className="w-full text-[21px] font-semibold text-foreground placeholder:text-muted-foreground bg-transparent"
        />
        {clientId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete client"
            title="Delete client"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 shrink-0 mt-0.5"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className="mb-3">
        <label className="block text-[11px] text-muted-foreground mb-1">Type (optional)</label>
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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {type === "INDIVIDUAL" && (
        <div className="mb-4">
          <label className="block text-[11px] text-muted-foreground mb-1">Company (optional)</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Who they work for"
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 placeholder:text-muted-foreground"
          />
        </div>
      )}

      {error && <p className="text-[13px] text-destructive mb-3" role="alert">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : clientId ? "Save changes" : "Add client"}
        </button>
      </div>
    </form>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.482l-.78 9.36A2 2 0 0 1 11.995 17.7H8.005a2 2 0 0 1-1.993-1.84l-.78-9.36H4.75a.75.75 0 0 1 0-1.5H8v-.5Zm1.5.5h1V5h-1v-0Zm-2.223 1.5.766 9.24a.5.5 0 0 0 .498.46h3.99a.5.5 0 0 0 .498-.46l.766-9.24H7.277Z" />
    </svg>
  );
}
