"use client";

import { useTransition } from "react";
import { deleteFreelanceProject, archiveFreelanceProject } from "@/app/actions/freelance";

export function ProjectActions({ id, archived }: { id: string; archived: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Delete this project and all its tasks? This can't be undone.")) return;
    startTransition(() => deleteFreelanceProject(id));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => startTransition(() => archiveFreelanceProject(id, !archived))}
        disabled={isPending}
        className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
      >
        {archived ? "Unarchive" : "Archive"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-[12.5px] font-medium text-red-400/80 hover:text-red-400 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
