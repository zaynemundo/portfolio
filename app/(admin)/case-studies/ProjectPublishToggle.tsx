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
          ? "bg-positive/12 text-positive hover:bg-positive/20"
          : "bg-warning/12 text-warning hover:bg-warning/20"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
