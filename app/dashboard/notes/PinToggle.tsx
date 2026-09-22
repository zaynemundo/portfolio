"use client";

import { useTransition } from "react";
import { toggleNotePinned } from "@/app/actions/notes";

export function PinToggle({ id, pinned }: { id: string; pinned: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => toggleNotePinned(id, !pinned))}
      disabled={isPending}
      aria-label={pinned ? "Unpin note" : "Pin note"}
      className={`shrink-0 text-[14px] transition-colors disabled:opacity-50 ${
        pinned ? "text-amber-400" : "text-zinc-700 hover:text-zinc-400"
      }`}
    >
      ★
    </button>
  );
}
