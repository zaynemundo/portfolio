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
      title={pinned ? "Unpin" : "Pin"}
      className={`h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800/60 transition-colors disabled:opacity-50 ${
        pinned ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
      }`}
    >
      <StarIcon filled={pinned} />
    </button>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M10 2.5 12.35 7.9l5.87.63-4.4 3.98 1.24 5.79L10 15.35l-5.06 2.95 1.24-5.79-4.4-3.98 5.87-.63L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
