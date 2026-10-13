"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteClient } from "@/app/actions/clients";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";

export function ClientCardMenu({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? Projects and transactions linked to them keep their history but lose the client link. This can't be undone.`)) return;
    startTransition(async () => {
      await deleteClient(id);
      router.refresh();
    });
  }

  return (
    <RowMenu disabled={isPending}>
      <RowMenuItem onClick={handleDelete} danger icon={<Trash2 size={14} />}>
        Delete
      </RowMenuItem>
    </RowMenu>
  );
}
