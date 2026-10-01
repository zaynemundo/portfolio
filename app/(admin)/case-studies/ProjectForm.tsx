"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Star } from "lucide-react";
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

  const borderlessInput = "w-full bg-transparent border-0 border-b border-transparent focus:border-border px-0 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors";
  const microLabel = "block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className={microLabel}>Name</label>
        <div className="flex items-center gap-2">
          <input
            id="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Name"
            className={`${borderlessInput} text-[26px] font-bold`}
          />
          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            aria-label={featured ? "Remove from Featured" : "Mark as Featured"}
            aria-pressed={featured}
            title={featured ? "Featured" : "Mark as Featured"}
            className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
              featured ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            <Star size={20} fill={featured ? "currentColor" : "none"} />
          </button>
        </div>
        <label htmlFor="slug" className={`${microLabel} mt-4`}>Slug</label>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[12.5px] text-muted-foreground/70 shrink-0">/projects/</span>
          <input
            id="slug"
            required
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            className={`${borderlessInput} flex-1 font-mono text-[12.5px] text-muted-foreground py-0.5`}
          />
          {slug && (
            <a
              href={`/projects/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open live case study in a new tab"
              title="Open live case study"
              className="text-muted-foreground/70 hover:text-primary transition-colors shrink-0"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="tagline" className={microLabel}>Tagline</label>
        <textarea
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          rows={2}
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div>
        <label htmlFor="shortDescription" className={microLabel}>Short description</label>
        <textarea
          id="shortDescription"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={3}
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <label htmlFor="category" className={microLabel}>Category</label>
          <input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${borderlessInput} text-[13.5px] w-40`}
          />
        </div>
        <div>
          <label htmlFor="year" className={microLabel}>Year</label>
          <input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024–2025"
            className={`${borderlessInput} text-[13.5px] w-40`}
          />
        </div>
        <div>
          <label htmlFor="workType" className={microLabel}>Work type</label>
          <select
            id="workType"
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className={`${borderlessInput} text-[13.5px] w-40`}
          >
            <option>Freelance</option>
            <option>Full-time</option>
            <option>Personal Project</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className={microLabel}>Status</label>
          <select
            id="status"
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className={`${borderlessInput} text-[13.5px] w-40 ${published ? "text-success" : "text-muted-foreground"}`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1">
          <label htmlFor="role" className={microLabel}>Role</label>
          <input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`${borderlessInput} text-[13.5px]`}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="client" className={microLabel}>Client (optional)</label>
          <input
            id="client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className={`${borderlessInput} text-[13.5px]`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="technologies" className={microLabel}>Technologies (comma-separated)</label>
        <input
          id="technologies"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="React, TypeScript, Tailwind"
          className={`${borderlessInput} text-[13.5px]`}
        />
      </div>

      <div>
        <label htmlFor="challenge" className={microLabel}>Challenge</label>
        <textarea
          id="challenge"
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          rows={4}
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div>
        <label htmlFor="approach" className={microLabel}>Approach</label>
        <textarea
          id="approach"
          value={approach}
          onChange={(e) => setApproach(e.target.value)}
          rows={4}
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div>
        <label htmlFor="outcome" className={microLabel}>Outcome</label>
        <textarea
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          rows={3}
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div>
        <label htmlFor="highlights" className={microLabel}>Highlights (one per line)</label>
        <textarea
          id="highlights"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          rows={4}
          className={`${borderlessInput} text-[14.5px] resize-none`}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1">
          <label htmlFor="liveUrl" className={microLabel}>Live URL (optional)</label>
          <input
            id="liveUrl"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className={`${borderlessInput} text-[13.5px]`}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="imageAlt" className={microLabel}>Image alt text</label>
          <input
            id="imageAlt"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className={`${borderlessInput} text-[13.5px]`}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="themeBg" className={microLabel}>Card background color</label>
          <input
            id="themeBg"
            value={themeBg}
            onChange={(e) => setThemeBg(e.target.value)}
            className={`${borderlessInput} text-[13.5px] w-32 font-mono`}
          />
        </div>
        <div>
          <label htmlFor="logoInitials" className={microLabel}>Logo initials</label>
          <input
            id="logoInitials"
            value={logoInitials}
            onChange={(e) => setLogoInitials(e.target.value)}
            placeholder="ZM"
            className={`${borderlessInput} text-[13.5px] w-32`}
          />
        </div>
        <div>
          <label htmlFor="logoBg" className={microLabel}>Logo background color</label>
          <input
            id="logoBg"
            value={logoBg}
            onChange={(e) => setLogoBg(e.target.value)}
            className={`${borderlessInput} text-[13.5px] w-32 font-mono`}
          />
        </div>
      </div>

      {mode === "edit" && projectId && (
        <div>
          <label className={microLabel}>Screenshots</label>
          <ImageManager projectId={projectId} images={images} />
        </div>
      )}

      <div>
        <label htmlFor="richContentJson" className={microLabel}>Advanced case-study content (JSON)</label>
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
