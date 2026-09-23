"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/app/actions/clients";
import { routes } from "@/app/(admin)/_routes";

export function DeleteClientButton({ id, name, onDeleted }: { id: string; name: string; onDeleted?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${name}"? Projects and transactions linked to them keep their history but lose the client link. This can't be undone.`)) return;
    startTransition(async () => {
      await deleteClient(id);
      if (onDeleted) onDeleted();
      else router.push(routes.clients.list);
    });
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
