"use client";

import { useState, useTransition } from "react";
import { updateSelectedWorkCopy } from "@/app/actions/settings";

export function SelectedWorkCopyForm({ initialHeading, initialIntro }: { initialHeading: string; initialIntro: string }) {
  const [heading, setHeading] = useState(initialHeading);
  const [intro, setIntro] = useState(initialIntro);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateSelectedWorkCopy({ heading, intro });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Section heading</label>
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Intro text</label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
        />
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[12.5px] text-emerald-400">Saved</span>}
      </div>
    </form>
  );
}
