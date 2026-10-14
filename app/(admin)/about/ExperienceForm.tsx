"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter, Principle } from "@/app/data/aboutChapters";
import { Section, Field, fieldClass, areaClass } from "@/app/(admin)/_components/Section";
import { TileGridEditor } from "@/app/(admin)/_components/TileGridEditor";

export function ExperienceForm({ chapter }: { chapter: Chapter }) {
  const [principles, setPrinciples] = useState<Principle[]>(chapter.principles ?? []);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, principles: principles.filter((p) => p.title.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <Section title="Experience" save={{ onSave: save, pending: isPending, saved }}>
      <TileGridEditor
        items={principles}
        onChange={setPrinciples}
        itemLabel="Role"
        newItem={() => ({ title: "", body: "" })}
        saveHint="Save"
        titleOf={(p) => p.title.split(" — ")[0]}
        renderPreview={(p) => {
          // "Company — Role (Years)": the company, then the position, then the years.
          const [company, ...rest] = p.title.split(" — ");
          const match = rest.join(" — ").match(/^(.*?)\s*\(([^)]*)\)\s*$/);
          const position = match ? match[1] : rest.join(" — ");
          const years = match?.[2];
          return (
            <>
              <span className="block text-[14px] font-semibold leading-snug text-foreground">{company || "No title yet"}</span>
              {position && <span className="mt-0.5 block text-[12.5px] text-foreground/70">{position}</span>}
              {years && <span className="mt-1.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{years}</span>}
            </>
          );
        }}
        renderEditor={(p, update) => (
          <>
            <Field label="Company, role and years">
              <input type="text" value={p.title} onChange={(e) => update({ title: e.target.value })} placeholder="Company — Role (Year – Year)" className={fieldClass} autoFocus />
            </Field>
            <Field label="What you did">
              <textarea value={p.body} onChange={(e) => update({ body: e.target.value })} rows={8} className={areaClass} />
            </Field>
          </>
        )}
      />
    </Section>
  );
}
