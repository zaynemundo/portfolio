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
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card/40 p-6 space-y-4">
      <p className="text-[12.5px] text-muted-foreground">Roles shown in the Experience chapter, most recent first.</p>

      <div className="space-y-3">
        {principles.map((p, i) => (
          <div key={i} className="rounded-lg border border-border bg-background/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role {i + 1}</span>
              <button type="button" onClick={() => setPrinciples((prev) => prev.filter((_, idx) => idx !== i))} className="text-[12px] text-destructive hover:text-destructive">
                Remove
              </button>
            </div>
            <input
              type="text"
              value={p.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Company — Role (Year – Year)"
              className="w-full rounded-lg bg-card border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors"
            />
            <textarea
              value={p.body}
              onChange={(e) => update(i, { body: e.target.value })}
              rows={3}
              placeholder="What you did in this role"
              className="w-full rounded-lg bg-card border border-border px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-ring transition-colors resize-y"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPrinciples((prev) => [...prev, { title: "", body: "" }])}
        className="w-full rounded-lg border border-dashed border-border text-muted-foreground text-[12.5px] font-medium py-2 hover:bg-card hover:text-foreground/90 transition-colors"
      >
        + Add role
      </button>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[12.5px] text-success">Saved</span>}
      </div>
    </form>
  );
}
