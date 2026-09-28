"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import type { Chapter, EducationItem, SkillGroup } from "@/app/data/aboutChapters";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateAboutChapter({ ...chapter, education, skillGroups: skillGroups.filter((g) => g.category.trim() !== "") });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <p className="text-[12.5px] text-zinc-500">Degree info and grouped skill tags.</p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Degree" value={education.degree} onChange={(v) => setEducation({ ...education, degree: v })} />
          <TextField label="Institution" value={education.institution} onChange={(v) => setEducation({ ...education, institution: v })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Honours (optional)" value={education.honours ?? ""} onChange={(v) => setEducation({ ...education, honours: v })} />
          <TextField label="Award (optional)" value={education.award ?? ""} onChange={(v) => setEducation({ ...education, award: v })} />
          <TextField label="Period" value={education.period} onChange={(v) => setEducation({ ...education, period: v })} placeholder="2019 – 2021" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium text-zinc-400">Skill groups</label>
        {skillGroups.map((g, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={g.category}
                onChange={(e) => updateGroup(i, { category: e.target.value })}
                placeholder="Category (e.g. Development)"
                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              <button type="button" onClick={() => setSkillGroups((prev) => prev.filter((_, idx) => idx !== i))} className="text-[12px] text-red-400 hover:text-red-300 shrink-0">
                Remove
              </button>
            </div>
            <input
              type="text"
              defaultValue={g.skills.join(", ")}
              onBlur={(e) => updateGroup(i, { skillsText: e.target.value })}
              placeholder="Skills, comma-separated"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSkillGroups((prev) => [...prev, { category: "", skills: [] }])}
          className="w-full rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-[12.5px] font-medium py-2 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
        >
          + Add skill group
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

function TextField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
      />
    </div>
  );
}
