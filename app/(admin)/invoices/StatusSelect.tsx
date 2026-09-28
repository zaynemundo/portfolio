"use client";

import { useTransition } from "react";
import { updateInvoiceStatus } from "@/app/actions/invoices";

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      onChange={(e) => startTransition(() => updateInvoiceStatus(id, e.target.value))}
      disabled={isPending}
      className="print:hidden rounded-lg bg-card border border-border px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring transition-colors disabled:opacity-50"
    >
      <option value="DRAFT">Draft</option>
      <option value="SENT">Sent</option>
      <option value="PAID">Paid</option>
      <option value="OVERDUE">Overdue</option>
    </select>
  );
}
