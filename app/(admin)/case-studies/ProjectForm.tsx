"use client";

import { useState, useTransition } from "react";
import { createProject, updateProject, type ProjectFormData } from "@/app/actions/projects";
import { ImageManager } from "./ImageManager";

interface Props {
  mode: "new" | "edit";
  projectId?: string;
  images?: string[];
  initial?: Partial<ProjectFormData>;
}

export function ProjectForm({ mode, projectId, images = [], initial }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [workType, setWorkType] = useState(initial?.workType ?? "Freelance");
  const [technologies, setTechnologies] = useState(initial?.technologies ?? "");
  const [challenge, setChallenge] = useState(initial?.challenge ?? "");
  const [approach, setApproach] = useState(initial?.approach ?? "");
  const [outcome, setOutcome] = useState(initial?.outcome ?? "");
  const [highlights, setHighlights] = useState(initial?.highlights ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "");
  const [themeBg, setThemeBg] = useState(initial?.themeBg ?? "#f4f4f5");
  const [logoInitials, setLogoInitials] = useState(initial?.logoInitials ?? "");
  const [logoBg, setLogoBg] = useState(initial?.logoBg ?? "#e5e5e5");
  const [richContentJson, setRichContentJson] = useState(initial?.richContentJson ?? "{}");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ProjectFormData = {
      slug, name, tagline, shortDescription, role, category, year, workType,
      technologies, challenge, approach, outcome, highlights, client, liveUrl,
      imageAlt, themeBg, logoInitials, logoBg, richContentJson, featured, published,
    };

    startTransition(async () => {
      const result = mode === "new" ? await createProject(data) : await updateProject(projectId!, data);
      if (result && !result.ok) {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" id="name" value={name} onChange={handleNameChange} />
        <div>
          <Field label="Slug" id="slug" value={slug} onChange={(v) => { setSlug(v); setSlugTouched(true); }} mono />
          <p className="mt-1 text-[11.5px] text-muted-foreground/70">/projects/{slug || "…"}</p>
        </div>
      </div>

      <TextArea label="Tagline" id="tagline" value={tagline} onChange={setTagline} rows={2} />
      <TextArea label="Short description" id="shortDescription" value={shortDescription} onChange={setShortDescription} rows={3} />

      <div className="grid grid-cols-3 gap-4">
        <Field label="Category" id="category" value={category} onChange={setCategory} />
        <Field label="Year" id="year" value={year} onChange={setYear} placeholder="2024–2025" />
        <div>
          <label htmlFor="workType" className="block text-xs font-medium text-muted-foreground mb-1.5">Work type</label>
          <select
            id="workType"
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className={selectClass}
          >
            <option>Freelance</option>
            <option>Full-time</option>
            <option>Personal Project</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Role" id="role" value={role} onChange={setRole} />
        <Field label="Client (optional)" id="client" value={client} onChange={setClient} />
      </div>

      <Field label="Technologies (comma-separated)" id="technologies" value={technologies} onChange={setTechnologies} placeholder="React, TypeScript, Tailwind" />

      <TextArea label="Challenge" id="challenge" value={challenge} onChange={setChallenge} rows={4} />
      <TextArea label="Approach" id="approach" value={approach} onChange={setApproach} rows={4} />
      <TextArea label="Outcome" id="outcome" value={outcome} onChange={setOutcome} rows={3} />
      <TextArea label="Highlights (one per line)" id="highlights" value={highlights} onChange={setHighlights} rows={4} />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Live URL (optional)" id="liveUrl" value={liveUrl} onChange={setLiveUrl} />
        <Field label="Image alt text" id="imageAlt" value={imageAlt} onChange={setImageAlt} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Card background color" id="themeBg" value={themeBg} onChange={setThemeBg} />
        <Field label="Logo initials" id="logoInitials" value={logoInitials} onChange={setLogoInitials} placeholder="ZM" />
        <Field label="Logo background color" id="logoBg" value={logoBg} onChange={setLogoBg} />
      </div>

      {mode === "edit" && projectId && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Screenshots</label>
          <ImageManager projectId={projectId} images={images} />
        </div>
      )}

      <div>
        <label htmlFor="richContentJson" className="block text-xs font-medium text-muted-foreground mb-1.5">
          Advanced case-study content (JSON)
        </label>
        <p className="text-[11.5px] text-muted-foreground/70 mb-2">
          Optional sections — hero metrics, problem/transformation write-ups, execution disciplines, results, deliverables, performance audit table, etc.
        </p>
        <textarea
          id="richContentJson"
          value={richContentJson}
          onChange={(e) => setRichContentJson(e.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-lg bg-card border border-border px-3.5 py-2.5 text-[12.5px] font-mono text-foreground/70 focus:outline-none focus:border-ring transition-colors resize-y"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-[13.5px] text-foreground/70 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-border bg-card" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-[13.5px] text-foreground/70 cursor-pointer">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded border-border bg-card" />
          Published
        </label>
      </div>

      {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : mode === "new" ? "Create case study" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-lg bg-card border border-border px-3.5 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-ring transition-colors";
const selectClass = inputClass;

function Field({
  label, id, value, onChange, placeholder, mono,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} ${mono ? "font-mono text-[13.5px]" : ""}`}
      />
    </div>
  );
}

function TextArea({
  label, id, value, onChange, rows,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void; rows: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}
