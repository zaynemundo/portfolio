"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter, EducationItem, SkillGroup } from "@/app/data/aboutChapters";
import { Section, Field, ItemCard, AddItemButton, fieldClass, labelClass } from "@/app/(admin)/_components/Section";

const EMPTY_EDUCATION: EducationItem = { degree: "", institution: "", honours: "", award: "", period: "" };

export function EducationForm({ chapter }: { chapter: Chapter }) {
  const [education, setEducation] = useState<EducationItem>(chapter.education ?? EMPTY_EDUCATION);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>(chapter.skillGroups ?? []);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateGroup(i: number, patch: Partial<{ category: string; skillsText: string }>) {
    setSkillGroups((prev) =>
      prev.map((g, idx) => {
        if (idx !== i) return g;
        if (patch.category !== undefined) return { ...g, category: patch.category };
        if (patch.skillsText !== undefined) return { ...g, skills: patch.skillsText.split(",").map((s) => s.trim()).filter(Boolean) };
        return g;
      })
    );
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, education, skillGroups: skillGroups.filter((g) => g.category.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <Section title="Education and skills" description="Your degree, and the skills shown as groups of tags beneath it." save={{ onSave: save, pending: isPending, saved }}>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Degree" value={education.degree} onChange={(v) => setEducation({ ...education, degree: v })} />
        <TextField label="Institution" value={education.institution} onChange={(v) => setEducation({ ...education, institution: v })} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <TextField label="Honours (optional)" value={education.honours ?? ""} onChange={(v) => setEducation({ ...education, honours: v })} />
        <TextField label="Award (optional)" value={education.award ?? ""} onChange={(v) => setEducation({ ...education, award: v })} />
        <TextField label="Period" value={education.period} onChange={(v) => setEducation({ ...education, period: v })} placeholder="2019 – 2021" />
      </div>

      <div className="border-t border-border pt-4">
        <span className={labelClass}>Skill groups</span>
        <div className="space-y-3">
          {skillGroups.map((g, i) => (
            <ItemCard key={i} label={`Group ${i + 1}`} summary={g.category} onRemove={() => setSkillGroups((prev) => prev.filter((_, idx) => idx !== i))}>
              <div className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-3">
                <Field label="Category">
                  <input type="text" value={g.category} onChange={(e) => updateGroup(i, { category: e.target.value })} placeholder="e.g. Development" className={fieldClass} />
                </Field>
                <Field label="Skills, separated by commas">
                  <input type="text" defaultValue={g.skills.join(", ")} onBlur={(e) => updateGroup(i, { skillsText: e.target.value })} placeholder="React, Next.js, TypeScript" className={fieldClass} />
                </Field>
              </div>
            </ItemCard>
          ))}
          <AddItemButton onClick={() => setSkillGroups((prev) => [...prev, { category: "", skills: [] }])}>Add skill group</AddItemButton>
        </div>
      </div>
    </Section>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </Field>
  );
}
