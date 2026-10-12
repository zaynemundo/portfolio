"use client";

import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Star } from "lucide-react";
import { createProject, updateProject, type ProjectFormData } from "@/app/actions/projects";
import { ImageManager } from "./ImageManager";
import { RichContentEditor } from "./RichContentEditor";
import { STRUCTURED_KEYS, cleanRichContent, isLongForm } from "./rich-schema";
import { SaveBar, useSaveState, useUnsavedWarning } from "@/app/(admin)/_components/SaveBar";

interface Props {
  mode: "new" | "edit";
  projectId?: string;
  images?: string[];
  initial?: Partial<ProjectFormData>;
}

type Obj = Record<string, unknown>;

/** Splits saved richContent into the part the structured editor owns and whatever else is stored alongside it. */
function splitRichContent(json: string | undefined): { structured: Obj; other: Obj } {
  let parsed: Obj = {};
  try {
    const value = JSON.parse(json || "{}");
    if (value && typeof value === "object" && !Array.isArray(value)) parsed = value;
  } catch {
    // Unreadable JSON — start from empty rather than crash the form.
  }
  const structured: Obj = {};
  const other: Obj = {};
  for (const [key, value] of Object.entries(parsed)) {
    (STRUCTURED_KEYS.has(key) ? structured : other)[key] = value;
  }
  return { structured, other };
}

export function ProjectForm({ mode, projectId, images = [], initial }: Props) {
  const initialRich = useMemo(() => splitRichContent(initial?.richContentJson), [initial?.richContentJson]);

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
  const [accessibility, setAccessibility] = useState(initial?.accessibility ?? "");
  const [performance, setPerformance] = useState(initial?.performance ?? "");
  const [seo, setSeo] = useState(initial?.seo ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "");
  const [imageLabels, setImageLabels] = useState(initial?.imageLabels ?? "");
  const [themeBg, setThemeBg] = useState(initial?.themeBg ?? "#f4f4f5");
  const [themeDark, setThemeDark] = useState(initial?.themeDark ?? false);
  const [logoInitials, setLogoInitials] = useState(initial?.logoInitials ?? "");
  const [logoBg, setLogoBg] = useState(initial?.logoBg ?? "#e5e5e5");
  const [logoLight, setLogoLight] = useState(initial?.logoLight ?? false);
  const [logoSrc, setLogoSrc] = useState(initial?.logoSrc ?? "");
  const [rich, setRich] = useState<Obj>(initialRich.structured);
  const [otherJson, setOtherJson] = useState(
    Object.keys(initialRich.other).length ? JSON.stringify(initialRich.other, null, 2) : "",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cleanedRich = useMemo(() => cleanRichContent(rich), [rich]);
  const longForm = isLongForm(cleanedRich);

  // "Other data" is free-typed JSON; null means it doesn't parse yet.
  const other = useMemo<Obj | null>(() => {
    if (!otherJson.trim()) return {};
    try {
      const parsed = JSON.parse(otherJson);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [otherJson]);

  const data: ProjectFormData = {
    slug, name, tagline, shortDescription, role, category, year, workType,
    technologies, challenge, approach, outcome, highlights, accessibility, performance, seo,
    client, liveUrl, imageAlt, imageLabels, themeBg, themeDark, logoInitials, logoBg, logoLight, logoSrc,
    richContentJson: JSON.stringify({ ...(other ?? {}), ...cleanedRich }),
    featured, published,
  };
  // otherJson is tracked too, so half-typed JSON still counts as an unsaved change.
  const saveState = useSaveState({ data, otherJson });
  useUnsavedWarning(saveState.dirty && !isPending);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (other === null) {
      setError("“Other data” isn't valid JSON. Fix it or clear the box.");
      return;
    }

    startTransition(async () => {
      const result = mode === "new" ? await createProject(data) : await updateProject(projectId!, data);
      if (result && !result.ok) {
        setError(result.error ?? "Something went wrong.");
      } else if (result?.ok) {
        saveState.markSaved({ data, otherJson });
      }
    });
  }

  const borderlessInput = "w-full bg-transparent border-0 border-b border-transparent focus:border-border px-0 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors";
  const microLabel = "block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1";
  const checkLabel = "flex items-center gap-2 text-[12.5px] text-foreground/80 cursor-pointer select-none";

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

      {/* ── Hero & cards ─────────────────────────────────────────────── */}
      <FormSection title="Hero & cards" hint="Shown at the top of the case study and on project cards across the site.">
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
      </FormSection>

      {/* ── Details ──────────────────────────────────────────────────── */}
      <FormSection title="Details" hint="The Details sidebar on the case study, and the labels on project cards.">
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

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label htmlFor="technologies" className={microLabel}>Technologies (comma-separated)</label>
            <input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, TypeScript, Tailwind"
              className={`${borderlessInput} text-[13.5px]`}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="liveUrl" className={microLabel}>Live URL (optional)</label>
            <input
              id="liveUrl"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://"
              className={`${borderlessInput} text-[13.5px]`}
            />
          </div>
        </div>
      </FormSection>

      {/* ── Screenshots & branding ───────────────────────────────────── */}
      <FormSection title="Screenshots & branding" hint="The image slider at the top of the case study, plus the card tint and client logo tile.">
        {mode === "edit" && projectId ? (
          <div>
            <label className={microLabel}>Screenshots</label>
            <ImageManager projectId={projectId} images={images} />
          </div>
        ) : (
          <p className="text-[12.5px] text-muted-foreground">Screenshots can be uploaded once the case study has been created.</p>
        )}

        <div className="flex items-start gap-6">
          <div className="flex-1">
            <label htmlFor="imageLabels" className={microLabel}>Screenshot captions (one per line, in order)</label>
            <textarea
              id="imageLabels"
              value={imageLabels}
              onChange={(e) => setImageLabels(e.target.value)}
              rows={4}
              placeholder={"Homepage\nProduct Listing\nProduct Detail"}
              className={`${borderlessInput} text-[13.5px] resize-none`}
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

        <div className="flex items-end gap-6 flex-wrap">
          <div>
            <label htmlFor="themeBg" className={microLabel}>Card background color</label>
            <div className="flex items-center gap-2">
              <Swatch color={themeBg} />
              <input
                id="themeBg"
                value={themeBg}
                onChange={(e) => setThemeBg(e.target.value)}
                className={`${borderlessInput} text-[13.5px] w-24 font-mono`}
              />
            </div>
          </div>
          <label className={`${checkLabel} pb-2`}>
            <input type="checkbox" checked={themeDark} onChange={(e) => setThemeDark(e.target.checked)} className="accent-primary" />
            Dark background (use light text on it)
          </label>
        </div>

        <div className="flex items-end gap-6 flex-wrap">
          <div>
            <label htmlFor="logoInitials" className={microLabel}>Logo initials</label>
            <input
              id="logoInitials"
              value={logoInitials}
              onChange={(e) => setLogoInitials(e.target.value)}
              placeholder="ZM"
              className={`${borderlessInput} text-[13.5px] w-24`}
            />
          </div>
          <div>
            <label htmlFor="logoBg" className={microLabel}>Logo background color</label>
            <div className="flex items-center gap-2">
              <Swatch color={logoBg} />
              <input
                id="logoBg"
                value={logoBg}
                onChange={(e) => setLogoBg(e.target.value)}
                className={`${borderlessInput} text-[13.5px] w-24 font-mono`}
              />
            </div>
          </div>
          <label className={`${checkLabel} pb-2`}>
            <input type="checkbox" checked={logoLight} onChange={(e) => setLogoLight(e.target.checked)} className="accent-primary" />
            Light initials (for a dark logo tile)
          </label>
        </div>

        <div>
          <label htmlFor="logoSrc" className={microLabel}>Logo image URL (optional — replaces the initials)</label>
          <input
            id="logoSrc"
            value={logoSrc}
            onChange={(e) => setLogoSrc(e.target.value)}
            className={`${borderlessInput} text-[13.5px]`}
          />
        </div>
      </FormSection>

      {/* ── Layout indicator ─────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[13px] text-foreground">
          <span className="font-semibold">Page layout: {longForm ? "Long-form" : "Simple"}.</span>{" "}
          <span className="text-muted-foreground">
            {longForm
              ? "This case study has long-form sections, so the public page shows those. The simple write-up below is kept but not displayed."
              : "The public page shows the simple write-up below. Fill in any long-form section to switch to the long-form layout instead."}
          </span>
        </p>
      </div>

      {/* ── Simple write-up ──────────────────────────────────────────── */}
      <FormSection
        title="Simple write-up"
        hint="Overview, Challenge, Approach, Key Contributions and Outcome on the simple layout. Challenge, Approach and Outcome are always required."
      >
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
          <label htmlFor="highlights" className={microLabel}>Key contributions (one per line)</label>
          <textarea
            id="highlights"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
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
          <label htmlFor="accessibility" className={microLabel}>Accessibility (optional)</label>
          <textarea
            id="accessibility"
            value={accessibility}
            onChange={(e) => setAccessibility(e.target.value)}
            rows={2}
            className={`${borderlessInput} text-[14.5px] resize-none`}
          />
        </div>

        <div>
          <label htmlFor="performance" className={microLabel}>Performance (optional)</label>
          <textarea
            id="performance"
            value={performance}
            onChange={(e) => setPerformance(e.target.value)}
            rows={2}
            className={`${borderlessInput} text-[14.5px] resize-none`}
          />
        </div>

        <div>
          <label htmlFor="seo" className={microLabel}>SEO (optional)</label>
          <textarea
            id="seo"
            value={seo}
            onChange={(e) => setSeo(e.target.value)}
            rows={2}
            className={`${borderlessInput} text-[14.5px] resize-none`}
          />
        </div>
      </FormSection>

      {/* ── Long-form sections ───────────────────────────────────────── */}
      <FormSection
        title="Long-form sections"
        hint="Optional. Listed in the order they appear on the public page — empty sections are simply left out."
      >
        <RichContentEditor value={rich} onChange={setRich} />

        {otherJson.trim() !== "" && (
          <details className="rounded-lg border border-border bg-card">
            <summary className="px-4 py-3 cursor-pointer text-[13px] font-semibold text-foreground">Other data (JSON)</summary>
            <div className="px-4 pb-4">
              <p className="text-[12px] text-muted-foreground mb-2">
                Stored with this case study but not shown on the public page. Leave as is unless you know you need it.
              </p>
              <textarea
                id="otherJson"
                aria-label="Other data (JSON)"
                value={otherJson}
                onChange={(e) => setOtherJson(e.target.value)}
                rows={8}
                spellCheck={false}
                className="w-full rounded-lg bg-background border border-border px-3.5 py-2.5 text-[12.5px] font-mono text-foreground/70 focus:outline-none focus:border-ring transition-colors resize-y"
              />
            </div>
          </details>
        )}
      </FormSection>

      <SaveBar
        dirty={saveState.dirty}
        pending={isPending}
        savedAt={saveState.savedAt}
        error={error}
        saveLabel={mode === "new" ? "Create case study" : "Save changes"}
        viewHref={mode === "edit" && published && slug ? `/projects/${slug}` : undefined}
      />
    </form>
  );
}

function FormSection({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
      <p className="text-[12px] text-muted-foreground mt-0.5 mb-5">{hint}</p>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="h-5 w-5 rounded-md border border-border shrink-0" style={{ background: color }} />;
}
