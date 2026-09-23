"use client";

import { useTransition } from "react";
import { markInquiryRead } from "@/app/actions/inquiries";

export function ReadToggle({ id, read }: { id: string; read: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markInquiryRead(id, !read))}
      disabled={isPending}
      className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
    >
      {isPending ? "Saving…" : read ? "Mark as unread" : "Mark as read"}
    </button>
  );
}
