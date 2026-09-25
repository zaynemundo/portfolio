"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleNotePinned, deleteNote } from "@/app/actions/notes";

export function NoteCardMenu({ id, title, pinned }: { id: string; title: string; pinned: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function togglePin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    startTransition(async () => {
      await toggleNotePinned(id, !pinned);
      router.refresh();
    });
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteNote(id);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        disabled={isPending}
        aria-label="More options"
        title="More"
        className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-800/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl py-1">
          <button
            type="button"
            onClick={togglePin}
            className="w-full text-left px-3 py-2 text-[13px] text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
          >
            <StarIcon filled={pinned} className={pinned ? "text-amber-400" : ""} />
            {pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-left px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="10" cy="15.5" r="1.4" />
    </svg>
  );
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path
        d="M10 2.5 12.35 7.9l5.87.63-4.4 3.98 1.24 5.79L10 15.35l-5.06 2.95 1.24-5.79-4.4-3.98 5.87-.63L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.482l-.78 9.36A2 2 0 0 1 11.995 17.7H8.005a2 2 0 0 1-1.993-1.84l-.78-9.36H4.75a.75.75 0 0 1 0-1.5H8v-.5Zm1.5.5h1V5h-1v-0Zm-2.223 1.5.766 9.24a.5.5 0 0 0 .498.46h3.99a.5.5 0 0 0 .498-.46l.766-9.24H7.277Z" />
    </svg>
  );
}
