"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter } from "@/app/data/aboutChapters";
import { Trash2 } from "lucide-react";
import { Section, Field, AddItemButton, fieldClass, areaClass, labelClass } from "@/app/(admin)/_components/Section";

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

  function save() {
    setSaved(false);
    const cleanItems = items.map((s) => s.trim()).filter(Boolean);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, title, introduction, items: cleanItems });
      setSaved(true);
    });
  }

  return (
    <Section title="What I do" description="The services headline, a short intro, and the list of things you offer." save={{ onSave: save, pending: isPending, saved }}>
      <Field label="Headline" htmlFor="servicesHeadline">
        <textarea id="servicesHeadline" value={title} onChange={(e) => setTitle(e.target.value)} rows={2} className={areaClass} />
      </Field>
      <Field label="Intro" htmlFor="servicesIntro">
        <textarea id="servicesIntro" value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows={3} className={areaClass} />
      </Field>

      <div>
        <span className={labelClass}>Services</span>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={item} onChange={(e) => updateItem(i, e.target.value)} placeholder="e.g. UI/UX Design" aria-label={`Service ${i + 1}`} className={fieldClass} />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                aria-label={`Remove service ${i + 1}`}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-negative/10 hover:text-negative transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <AddItemButton onClick={addItem}>Add service</AddItemButton>
        </div>
      </div>
    </Section>
  );
}
