"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter } from "@/app/data/aboutChapters";

export function ServicesForm({ chapter }: { chapter: Chapter }) {
  const [title, setTitle] = useState(chapter.title);
  const [introduction, setIntroduction] = useState(chapter.introduction ?? "");
  const [items, setItems] = useState<string[]>(chapter.items && chapter.items.length > 0 ? chapter.items : [""]);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateItem(i: number, value: string) {
    setItems((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const cleanItems = items.map((s) => s.trim()).filter(Boolean);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, title, introduction, items: cleanItems });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
      <p className="text-[12.5px] text-zinc-500">Services headline, intro text, and the list of capabilities.</p>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Headline</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={2}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Intro</label>
        <textarea
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Services</label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder="e.g. UI/UX Design"
                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                aria-label="Remove service"
                className="shrink-0 h-9 w-9 rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:border-zinc-800 flex items-center justify-center text-[15px]"
              >
                −
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 w-full rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-[12.5px] font-medium py-2 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
        >
          + Add service
        </button>
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
