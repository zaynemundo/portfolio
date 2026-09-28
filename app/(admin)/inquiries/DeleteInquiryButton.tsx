"use client";

import { useTransition } from "react";
import { deleteInquiry } from "@/app/actions/inquiries";

export function DeleteInquiryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Delete the inquiry from ${name}? This can't be undone.`)) return;
    startTransition(() => deleteInquiry(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-[12.5px] font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
