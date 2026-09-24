"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteNote } from "@/app/actions/notes";
import { routes } from "@/app/(admin)/_routes";

export function DeleteNoteButton({ id, title, onDeleted }: { id: string; title: string; onDeleted?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteNote(id);
      if (onDeleted) onDeleted();
      else router.push(routes.notes.list);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="Delete note"
      title="Delete note"
      className="h-7 w-7 flex items-center justify-center rounded text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      <TrashIcon />
    </button>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.482l-.78 9.36A2 2 0 0 1 11.995 17.7H8.005a2 2 0 0 1-1.993-1.84l-.78-9.36H4.75a.75.75 0 0 1 0-1.5H8v-.5Zm1.5.5h1V5h-1v-0Zm-2.223 1.5.766 9.24a.5.5 0 0 0 .498.46h3.99a.5.5 0 0 0 .498-.46l.766-9.24H7.277Z" />
    </svg>
  );
}
