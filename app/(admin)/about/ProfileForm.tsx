"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter } from "@/app/data/aboutChapters";
import { Section, Field, AddItemButton, areaClass } from "@/app/(admin)/_components/Section";

export function ProfileForm({ chapter }: { chapter: Chapter }) {
  const [title, setTitle] = useState(chapter.title);
  const [paragraphs, setParagraphs] = useState<string[]>(chapter.paragraphs ?? [""]);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, title, paragraphs: paragraphs.filter((p) => p.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <Section title="Bio" save={{ onSave: save, pending: isPending, saved }}>
      <Field label="Headline" htmlFor="profileHeadline">
        <textarea id="profileHeadline" value={title} onChange={(e) => setTitle(e.target.value)} rows={2} className={areaClass} />
      </Field>

      {paragraphs.map((p, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={`profileParagraph${i}`} className="text-[12px] font-medium text-foreground/80">Paragraph {i + 1}</label>
            {paragraphs.length > 1 && (
              <button type="button" onClick={() => setParagraphs((prev) => prev.filter((_, idx) => idx !== i))} className="text-[12px] font-medium text-muted-foreground hover:text-negative transition-colors">
                Remove
              </button>
            )}
          </div>
          <textarea
            id={`profileParagraph${i}`}
            value={p}
            onChange={(e) => setParagraphs((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
            rows={4}
            className={areaClass}
          />
        </div>
      ))}

      <AddItemButton onClick={() => setParagraphs((prev) => [...prev, ""])}>Add paragraph</AddItemButton>
    </Section>
  );
}
