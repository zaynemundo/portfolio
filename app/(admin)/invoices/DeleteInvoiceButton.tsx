"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { rowMenuItemClass } from "@/app/(admin)/_components/ui/RowMenu";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "@/app/actions/invoices";
import { routes } from "@/app/(admin)/_routes";

export function DeleteInvoiceButton({ id, number, onDeleted, menu }: { id: string; number: string; onDeleted?: () => void; /** Styled as a line in a row's "…" menu. */ menu?: boolean }) {
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
      className={menu ? rowMenuItemClass(true) : "text-[12.5px] font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-50"}
    >
      {menu && <Trash2 size={14} />}
      Delete
    </button>
  );
}
