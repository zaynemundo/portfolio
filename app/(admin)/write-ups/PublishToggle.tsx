"use client";

import { useState, useTransition } from "react";
import { togglePublished } from "@/app/actions/posts";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await togglePublished(id, !published);
      if (!result.ok) setError(result.error ?? "Couldn't change this.");
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`text-[11px] font-semibold px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
          published
          ? "bg-positive/12 text-positive hover:bg-positive/20"
          : "bg-warning/12 text-warning hover:bg-warning/20"
        }`}
      >
        {published ? "Published" : "Draft"}
      </button>
      {error && <p className="mt-1 text-[12px] text-destructive" role="alert">{error}</p>}
    </>
  );
}
