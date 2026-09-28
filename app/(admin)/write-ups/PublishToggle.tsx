"use client";

import { useTransition } from "react";
import { togglePublished } from "@/app/actions/posts";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => togglePublished(id, !published))}
      disabled={isPending}
      className={`text-[11px] font-semibold px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
        published
          ? "bg-success/15 text-success hover:bg-success/25"
          : "bg-secondary text-muted-foreground hover:bg-secondary"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
