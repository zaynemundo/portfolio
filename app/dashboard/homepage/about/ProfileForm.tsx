"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter } from "@/app/data/aboutChapters";

export function ProfileForm({ chapter }: { chapter: Chapter }) {
  const [title, setTitle] = useState(chapter.title);
  const [paragraphs, setParagraphs] = useState<string[]>(chapter.paragraphs ?? [""]);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, title, paragraphs: paragraphs.filter((p) => p.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">01 · Profile</h2>
        <p className="text-[12.5px] text-zinc-500">The opening headline and intro paragraphs of the About section.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Headline</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={2}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
        />
      </div>

      {paragraphs.map((p, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-zinc-400">Paragraph {i + 1}</label>
            {paragraphs.length > 1 && (
              <button type="button" onClick={() => setParagraphs((prev) => prev.filter((_, idx) => idx !== i))} className="text-[11.5px] text-red-400 hover:text-red-300">
                Remove
              </button>
            )}
          </div>
          <textarea
            value={p}
            onChange={(e) => setParagraphs((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
            rows={3}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => setParagraphs((prev) => [...prev, ""])}
        className="w-full rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-[12.5px] font-medium py-2 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
      >
        + Add paragraph
      </button>

      <div className="flex items-center gap-3">
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
