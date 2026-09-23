"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/actions/clients";

export interface ClientOption {
  id: string;
  name: string;
}

interface Props {
  id?: string;
  value: string;
  onChange: (clientId: string) => void;
  clients: ClientOption[];
  onClientCreated?: (client: ClientOption) => void;
  className?: string;
}

const ADD_NEW = "__add_new_client__";

export function ClientSelect({ id, value, onChange, clients, onClientCreated, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    if (selected !== ADD_NEW) {
      onChange(selected);
      return;
    }

    const name = window.prompt("New client name");
    if (!name || !name.trim()) return;

    startTransition(async () => {
      const result = await createClient({ name, email: "", phone: "", company: "", notes: "" });
      if (result.ok && result.id) {
        const client = { id: result.id, name: name.trim() };
        onChange(client.id);
        if (onClientCreated) onClientCreated(client);
        else router.refresh();
      } else {
        window.alert(result.error ?? "Couldn't create client.");
      }
    });
  }

  return (
    <select id={id} value={value} onChange={handleChange} disabled={isPending} className={className}>
      <option value="">—</option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
      <option value={ADD_NEW}>+ Add new client…</option>
    </select>
  );
}
