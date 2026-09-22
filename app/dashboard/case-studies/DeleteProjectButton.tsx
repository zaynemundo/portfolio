"use client";

import { useTransition } from "react";
import { deleteProject } from "@/app/actions/projects";

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(() => deleteProject(id));
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
