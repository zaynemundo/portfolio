"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "@/app/actions/invoices";
import { routes } from "@/app/(admin)/_routes";

export function DeleteInvoiceButton({ id, number, onDeleted }: { id: string; number: string; onDeleted?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete invoice ${number}? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteInvoice(id);
      if (onDeleted) onDeleted();
      else router.push(routes.finance.list);
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
