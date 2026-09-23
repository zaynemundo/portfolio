"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter, Principle } from "@/app/data/aboutChapters";

export function ExperienceForm({ chapter }: { chapter: Chapter }) {
  const [principles, setPrinciples] = useState<Principle[]>(chapter.principles ?? []);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(i: number, patch: Partial<Principle>) {
    setPrinciples((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, principles: principles.filter((p) => p.title.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">03 · Experience</h2>
        <p className="text-[12.5px] text-zinc-500">Roles shown in the Experience chapter, most recent first.</p>
      </div>

      <div className="space-y-3">
        {principles.map((p, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Role {i + 1}</span>
              <button type="button" onClick={() => setPrinciples((prev) => prev.filter((_, idx) => idx !== i))} className="text-[12px] text-red-400 hover:text-red-300">
                Remove
              </button>
            </div>
            <input
              type="text"
              value={p.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Company — Role (Year – Year)"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <textarea
              value={p.body}
              onChange={(e) => update(i, { body: e.target.value })}
              rows={3}
              placeholder="What you did in this role"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPrinciples((prev) => [...prev, { title: "", body: "" }])}
        className="w-full rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-[12.5px] font-medium py-2 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
      >
        + Add role
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
