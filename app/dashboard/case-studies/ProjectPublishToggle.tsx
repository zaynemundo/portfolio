"use client";

import { useTransition } from "react";
import { toggleProjectPublished } from "@/app/actions/projects";

export function ProjectPublishToggle({ id, published }: { id: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleProjectPublished(id, !published))}
      disabled={isPending}
      className={`text-[11px] font-semibold px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
        published
          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
