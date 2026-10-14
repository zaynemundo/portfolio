"use client";

import { useState, useTransition } from "react";
import { updateAboutChapter } from "@/app/actions/settings";
import { educationOf, type Certificate, type Chapter, type EducationItem, type SkillGroup } from "@/app/data/aboutChapters";
import { Section, Field, fieldClass, labelClass } from "@/app/(admin)/_components/Section";
import { ChipListInput } from "@/app/(admin)/_components/ChipListInput";
import { TileGridEditor } from "@/app/(admin)/_components/TileGridEditor";

const EMPTY_EDUCATION: EducationItem = { degree: "", institution: "", honours: "", award: "", period: "" };
const EMPTY_CERTIFICATE: Certificate = { name: "", issuer: "", year: "", url: "" };

export function EducationForm({ chapter }: { chapter: Chapter }) {
  const [educationList, setEducationList] = useState<EducationItem[]>(educationOf(chapter));
  const [certificates, setCertificates] = useState<Certificate[]>(chapter.certificates ?? []);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>(chapter.skillGroups ?? []);
  /* All three cards save the same chapter; "Saved" shows on the card whose button was pressed. */
  const [savedOn, setSavedOn] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(card: string) {
    setSavedOn(null);
    startTransition(async () => {
      const degrees = educationList.filter((e) => e.degree.trim() !== "");
      await updateAboutChapter({
        ...chapter,
        educationList: degrees,
        education: degrees[0],
        certificates: certificates.filter((c) => c.name.trim() !== ""),
        skillGroups: skillGroups
        .filter((g) => g.category.trim() !== "")
        .map((g) => ({ ...g, skills: g.skills.map((s) => s.trim()).filter(Boolean) })),
      });
      setSavedOn(card);
    });
  }

  const saveFor = (card: string) => ({ onSave: () => save(card), pending: isPending, saved: savedOn === card });

  return (
    <>
    <Section title="Education" save={saveFor("education")}>
        <TileGridEditor
          items={educationList}
          onChange={setEducationList}
          itemLabel="Degree"
          newItem={() => ({ ...EMPTY_EDUCATION })}
          saveHint="Save"
          titleOf={(e) => e.degree}
          renderPreview={(e) => (
            <>
              <span className="block text-[14px] font-semibold leading-snug text-foreground">{e.degree || "No degree yet"}</span>
              {e.institution && <span className="mt-0.5 block text-[12.5px] text-foreground/70">{e.institution}</span>}
              {e.period && <span className="mt-1.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{e.period}</span>}
            </>
          )}
          renderEditor={(e, update) => (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField label="Degree" value={e.degree} onChange={(v) => update({ degree: v })} />
                <TextField label="Institution" value={e.institution} onChange={(v) => update({ institution: v })} />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <TextField label="Honours (optional)" value={e.honours ?? ""} onChange={(v) => update({ honours: v })} />
                <TextField label="Award (optional)" value={e.award ?? ""} onChange={(v) => update({ award: v })} />
                <TextField label="Period" value={e.period} onChange={(v) => update({ period: v })} placeholder="2019 – 2021" />
              </div>
            </>
          )}
        />
    </Section>

    <Section title="Certificates" description="Optional. Hidden on the site until you add one." save={saveFor("certificates")}>
        <TileGridEditor
          items={certificates}
          onChange={setCertificates}
          itemLabel="Certificate"
          newItem={() => ({ ...EMPTY_CERTIFICATE })}
          saveHint="Save"
          titleOf={(c) => c.name}
          renderPreview={(c) => (
            <>
              <span className="block text-[14px] font-semibold leading-snug text-foreground">{c.name || "No name yet"}</span>
              {c.issuer && <span className="mt-0.5 block text-[12.5px] text-foreground/70">{c.issuer}</span>}
              {c.year && <span className="mt-1.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{c.year}</span>}
            </>
          )}
          renderEditor={(c, update) => (
            <>
              <TextField label="Certificate" value={c.name} onChange={(v) => update({ name: v })} placeholder="Google UX Design Certificate" />
              <div className="grid sm:grid-cols-[minmax(0,1fr)_160px] gap-3">
                <TextField label="Issued by" value={c.issuer} onChange={(v) => update({ issuer: v })} placeholder="Coursera" />
                <TextField label="Year (optional)" value={c.year ?? ""} onChange={(v) => update({ year: v })} placeholder="2024" />
              </div>
              <TextField label="Link to check it (optional)" value={c.url ?? ""} onChange={(v) => update({ url: v })} placeholder="https://…" />
            </>
          )}
        />
    </Section>

    <Section title="Skill groups" save={saveFor("skills")}>
        <TileGridEditor
          items={skillGroups}
          onChange={setSkillGroups}
          itemLabel="Skill group"
          newItem={() => ({ category: "", skills: [] })}
          saveHint="Save"
          titleOf={(g) => g.category}
          renderMeta={(g) => {
            const count = g.skills.filter((skill) => skill.trim()).length;
            return count > 0 ? `${count} skill${count === 1 ? "" : "s"}` : null;
          }}
          renderPreview={(g) => {
            const count = g.skills.filter((skill) => skill.trim()).length;
            return (
              <>
                <span className="block text-[14px] font-semibold leading-snug text-foreground">{g.category || "No category yet"}</span>
                {count === 0 && <span className="mt-0.5 block text-[12.5px] text-muted-foreground">No skills yet</span>}
              </>
            );
          }}
          renderEditor={(g, update) => (
            <>
              <Field label="Category">
                <input type="text" value={g.category} onChange={(e) => update({ category: e.target.value })} placeholder="e.g. Development" className={fieldClass} autoFocus />
              </Field>
              <div>
                <span className={labelClass}>Skills</span>
                <ChipListInput items={g.skills} onChange={(skills) => update({ skills })} itemLabel="skill" placeholder="e.g. React" />
              </div>
            </>
          )}
        />
    </Section>
    </>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </Field>
  );
}
