"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter, Principle } from "@/app/data/aboutChapters";
import { Section, Field, ItemCard, AddItemButton, fieldClass, areaClass } from "@/app/(admin)/_components/Section";

export function ExperienceForm({ chapter }: { chapter: Chapter }) {
  const [principles, setPrinciples] = useState<Principle[]>(chapter.principles ?? []);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(i: number, patch: Partial<Principle>) {
    setPrinciples((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, principles: principles.filter((p) => p.title.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <Section title="Experience" description="The roles shown in the Experience chapter, most recent first." save={{ onSave: save, pending: isPending, saved }}>
      {principles.length === 0 && (
        <p className="rounded-xl border border-dashed border-border py-6 text-center text-[13px] text-muted-foreground">No roles yet.</p>
      )}
      {principles.map((p, i) => (
        <ItemCard key={i} label={`Role ${i + 1}`} summary={p.title} onRemove={() => setPrinciples((prev) => prev.filter((_, idx) => idx !== i))}>
          <Field label="Company, role and years">
            <input type="text" value={p.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Company — Role (Year – Year)" className={fieldClass} />
          </Field>
          <Field label="What you did">
            <textarea value={p.body} onChange={(e) => update(i, { body: e.target.value })} rows={3} className={areaClass} />
          </Field>
        </ItemCard>
      ))}
      <AddItemButton onClick={() => setPrinciples((prev) => [...prev, { title: "", body: "" }])}>Add role</AddItemButton>
    </Section>
  );
}
