"use client";

import { useTransition } from "react";
import { deleteInvoice } from "@/app/actions/invoices";

export function DeleteInvoiceButton({ id, number }: { id: string; number: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete invoice ${number}? This can't be undone.`)) return;
    startTransition(() => deleteInvoice(id));
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
