"use client";

import { useTransition } from "react";
import { deletePost } from "@/app/actions/posts";

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(() => deletePost(id));
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
