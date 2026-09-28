"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/actions/clients";
import { Select } from "./Select";

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

export function ClientSelect({ value, onChange, clients, onClientCreated, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAddNew() {
    const name = window.prompt("New client name");
    if (!name || !name.trim()) return;

    startTransition(async () => {
      const result = await createClient({ name, type: "", phone: "", company: "" });
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
    <Select
      value={value}
      onChange={onChange}
      options={[{ value: "", label: "—" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
      extraAction={{ label: "+ Add new client…", onSelect: handleAddNew }}
      className={isPending ? `${className} opacity-50 pointer-events-none` : className}
    />
  );
}
