"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveFreelanceProject, deleteFreelanceProject } from "@/app/actions/freelance";

export function FreelanceCardMenu({ id, name, archived }: { id: string; name: string; archived: boolean }) {
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

  function toggleArchive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    startTransition(async () => {
      await archiveFreelanceProject(id, !archived);
      router.refresh();
    });
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    if (!window.confirm(`Delete "${name}" and all its tasks? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteFreelanceProject(id);
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
        className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-border bg-card shadow-xl py-1">
          <button
            type="button"
            onClick={toggleArchive}
            className="w-full text-left px-3 py-2 text-[13px] text-foreground/90 hover:bg-secondary flex items-center gap-2 transition-colors"
          >
            <ArchiveIcon />
            {archived ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-left px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
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

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 7.5V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.2 10.5h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
