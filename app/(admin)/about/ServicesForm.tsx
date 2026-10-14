"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter } from "@/app/data/aboutChapters";
import { Section, Field, areaClass, labelClass } from "@/app/(admin)/_components/Section";
import { ChipListInput } from "@/app/(admin)/_components/ChipListInput";

export function ServicesForm({ chapter }: { chapter: Chapter }) {
  const [title, setTitle] = useState(chapter.title);
  const [introduction, setIntroduction] = useState(chapter.introduction ?? "");
  const [items, setItems] = useState<string[]>(chapter.items ?? []);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    const cleanItems = items.map((s) => s.trim()).filter(Boolean);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, title, introduction, items: cleanItems });
      setSaved(true);
    });
  }

  return (
    <Section title="Services" save={{ onSave: save, pending: isPending, saved }}>
      <Field label="Headline" htmlFor="servicesHeadline">
        <textarea id="servicesHeadline" value={title} onChange={(e) => setTitle(e.target.value)} rows={2} className={areaClass} />
      </Field>
      <Field label="Intro" htmlFor="servicesIntro">
        <textarea id="servicesIntro" value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows={3} className={areaClass} />
      </Field>

      <div>
        <span className={labelClass}>Services</span>
        <ChipListInput items={items} onChange={setItems} itemLabel="service" placeholder="e.g. UI/UX Design" />
      </div>
    </Section>
  );
}
