"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { rowMenuItemClass } from "@/app/(admin)/_components/ui/RowMenu";
import { deletePost } from "@/app/actions/posts";

export function DeleteButton({ id, title, menu }: { id: string; title: string; /** Styled as a line in a row's "…" menu. */ menu?: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(() => deletePost(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={menu ? rowMenuItemClass(true) : "text-[12.5px] font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-50"}
    >
      {menu && <Trash2 size={14} />}
      Delete
    </button>
  );
}
