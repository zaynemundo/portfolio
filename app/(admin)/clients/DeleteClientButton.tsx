"use client";

import { useTransition } from "react";
import { deleteClient } from "@/app/actions/clients";

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${name}"? Projects and transactions linked to them keep their history but lose the client link. This can't be undone.`)) return;
    startTransition(() => deleteClient(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-[12.5px] font-medium text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      Delete
    </button>
  );
}
