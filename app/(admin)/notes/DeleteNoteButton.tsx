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
      className="text-[12.5px] font-medium text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      Delete
    </button>
  );
}
