"use client";

import { useTransition } from "react";
import { stopRepeating } from "@/app/actions/invoices";

export function StopRepeatingButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm("Stop making a new draft of this invoice each month? The ones already made stay.")) {
          startTransition(() => stopRepeating(id));
        }
      }}
      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
    >
      {isPending ? "Stopping…" : "Stop repeating"}
    </button>
  );
}
