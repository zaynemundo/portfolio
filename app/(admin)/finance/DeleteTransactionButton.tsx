"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTransaction } from "@/app/actions/finance";
import { routes } from "@/app/(admin)/_routes";

export function DeleteTransactionButton({ id, onDeleted }: { id: string; onDeleted?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this transaction? This can't be undone.")) return;
    startTransition(async () => {
      await deleteTransaction(id);
      if (onDeleted) onDeleted();
      else router.push(routes.finance.list);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-[12.5px] font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-50"
    >
      Delete
    </button>
  );
}
