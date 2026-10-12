"use client";

import { useTransition } from "react";
import { updateInvoiceStatus } from "@/app/actions/invoices";

const OPTIONS: Record<"INVOICE" | "QUOTE", { value: string; label: string }[]> = {
  INVOICE: [
    { value: "DRAFT", label: "Draft" },
    { value: "SENT", label: "Sent" },
    { value: "OVERDUE", label: "Overdue" },
  ],
  QUOTE: [
    { value: "DRAFT", label: "Draft" },
    { value: "SENT", label: "Sent" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "DECLINED", label: "Declined" },
  ],
};

/**
 * Status for an unpaid invoice or a quote. A paid invoice has no dropdown —
 * it's paid because of its payments, and removing a payment is how to undo it.
 */
export function StatusSelect({ id, status, kind }: { id: string; status: string; kind: "INVOICE" | "QUOTE" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      onChange={(e) => startTransition(() => updateInvoiceStatus(id, e.target.value))}
      disabled={isPending}
      aria-label="Status"
      className="print:hidden rounded-lg bg-card border border-border px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring transition-colors disabled:opacity-50"
    >
      {OPTIONS[kind].map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
