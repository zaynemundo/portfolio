"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/app/(admin)/_components/Modal";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { ClientForm } from "./ClientForm";
import { DeleteClientButton } from "./DeleteClientButton";
import { routes } from "@/app/(admin)/_routes";
import type { ClientFormData } from "@/app/actions/clients";

export interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  projectCount: number;
  transactionCount: number;
}

export function ClientsClient({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"new" | ClientRow | null>(null);

  function close() {
    setModal(null);
    router.refresh();
  }

  const editing = modal && modal !== "new" ? modal : null;
  const initial: Partial<ClientFormData> | undefined = editing
    ? { name: editing.name, email: editing.email ?? "", phone: editing.phone ?? "", company: editing.company ?? "", notes: editing.notes ?? "" }
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Clients</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{clients.length} client{clients.length === 1 ? "" : "s"}</p>
        </div>
        <button
          type="button"
          onClick={() => setModal("new")}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState message="No clients yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setModal(client)}
              className="text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
            >
              <h3 className="text-[14.5px] font-semibold text-zinc-100 mb-0.5">{client.name}</h3>
              {client.company && <p className="text-[12.5px] text-zinc-500 mb-3">{client.company}</p>}
              <div className="flex items-center gap-4 text-[12px] text-zinc-500">
                <span>{client.projectCount} project{client.projectCount === 1 ? "" : "s"}</span>
                <span>{client.transactionCount} transaction{client.transactionCount === 1 ? "" : "s"}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={modal !== null} onClose={close} title={editing ? editing.name : "New client"}>
        <ClientForm mode={editing ? "edit" : "new"} clientId={editing?.id} initial={initial} onSuccess={close} />
        {editing && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <Link href={routes.clients.item(editing.id)} className="text-[12.5px] font-medium text-purple-400 hover:text-purple-300 transition-colors">
              View history →
            </Link>
            <DeleteClientButton id={editing.id} name={editing.name} onDeleted={close} />
          </div>
        )}
      </Modal>
    </div>
  );
}
