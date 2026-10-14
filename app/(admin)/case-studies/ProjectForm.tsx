"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { createProject, updateProject, uploadProjectLogo, type ProjectFormData } from "@/app/actions/projects";
import { GalleryEditor, type GalleryImage } from "./GalleryEditor";
import { RichContentEditor, FieldsEditor } from "./RichContentEditor";
import { RICH_SECTIONS, STRUCTURED_KEYS, cleanRichContent } from "./rich-schema";
import { SaveBar, useSaveState, useUnsavedWarning } from "@/app/(admin)/_components/SaveBar";
import { cardClass, tabBarClass, tabClass } from "@/app/(admin)/_components/ui/Card";
import { Switch } from "@/app/(admin)/_components/ui/Switch";
import { Select } from "@/app/(admin)/_components/Select";
import { Section, SectionStack, Field, fieldClass, areaClass, labelClass } from "@/app/(admin)/_components/Section";

interface Props {
  mode: "new" | "edit";
  projectId?: string;
  initial?: Partial<ProjectFormData>;
}

type Obj = Record<string, unknown>;

type Tab = "basics" | "media" | "story";
const TABS: { id: Tab; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "media", label: "Media" },
  { id: "story", label: "Story" },
];

const WORK_TYPES = ["Freelance", "Full-time", "Personal Project"];

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

export function ProjectForm({ mode, projectId, initial }: Props) {
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
  // The old short write-up. No longer edited here; the values are carried through unchanged on save.
  const [challenge] = useState(initial?.challenge ?? "");
  const [approach] = useState(initial?.approach ?? "");
  const [outcome] = useState(initial?.outcome ?? "");
  const [highlights] = useState(initial?.highlights ?? "");
  const [accessibility] = useState(initial?.accessibility ?? "");
  const [performance] = useState(initial?.performance ?? "");
  const [seo] = useState(initial?.seo ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  // The project-wide alt text; each image's own alt text now takes its place, so it's only a fallback.
  const [imageAlt] = useState(initial?.imageAlt ?? "");
  const [gallery, setGallery] = useState<GalleryImage[]>(() =>
    (initial?.images ?? []).map((url, i) => ({
      url,
      caption: initial?.imageLabels?.[i] ?? "",
      // Images saved before per-image alt text existed start from the old shared description on the cover.
      alt: initial?.imageAlts?.[i] ?? (i === 0 ? initial?.imageAlt ?? "" : ""),
    })),
  );
  // The card tint and the old initials tile no longer have controls; their saved values are carried through unchanged.
  const [themeBg] = useState(initial?.themeBg ?? "#f4f4f5");
  const [themeDark] = useState(initial?.themeDark ?? false);
  const [logoInitials] = useState(initial?.logoInitials ?? "");
  const [logoBg] = useState(initial?.logoBg ?? "#e5e5e5");
  const [logoLight] = useState(initial?.logoLight ?? false);
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

  const [tab, setTab] = useState<Tab>("basics");
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
    client, liveUrl, imageAlt: gallery[0]?.alt || imageAlt,
    images: gallery.map((g) => g.url), imageLabels: gallery.map((g) => g.caption), imageAlts: gallery.map((g) => g.alt),
    themeBg, themeDark, logoInitials, logoBg, logoLight, logoSrc,
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
  const selectClass = `${fieldClass} flex items-center justify-between gap-2 text-left`;
  const sidebarFields = RICH_SECTIONS.find((section) => section.id === "sidebar")?.fields ?? [];

  return (
    <form onSubmit={handleSubmit}>
      <div className={`${cardClass} p-5 mb-5`}>
        <label htmlFor="name" className={labelClass}>Name</label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Name"
          className={`${borderlessInput} text-[26px] font-bold`}
        />
        <div className="mt-2 flex items-center gap-1.5">
          <label htmlFor="slug" className="font-mono text-[12.5px] text-muted-foreground/70 shrink-0">/work/</label>
          <input
            id="slug"
            required
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            aria-label="Address"
            className={`${borderlessInput} flex-1 font-mono text-[12.5px] text-muted-foreground py-0.5`}
          />
        </div>
      </div>

      <div className={tabBarClass} role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={tabClass(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        {/* ── Basics ───────────────────────────────────────────────────── */}
        {tab === "basics" && (
          <SectionStack>
            <Section title="Summary">
              <Field label="Tagline" htmlFor="tagline">
                <textarea id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} className={areaClass} />
              </Field>
              <Field label="Short description" htmlFor="shortDescription">
                <textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className={areaClass} />
              </Field>
            </Section>

            <Section title="Visibility" description="Drafts are only visible to you.">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className={labelClass}>Status</span>
                  <Select
                    value={published ? "published" : "draft"}
                    onChange={(value) => setPublished(value === "published")}
                    options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]}
                    className={selectClass}
                  />
                </div>
                <div>
                  <span className={labelClass}>Featured</span>
                  <div className={`${fieldClass} flex items-center justify-between gap-3`}>
                    {featured ? "Featured" : "Not featured"}
                    <Switch checked={featured} onCheckedChange={setFeatured} aria-label="Featured" />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Details">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Category" htmlFor="category">
                  <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass} />
                </Field>
                <Field label="Year" htmlFor="year">
                  <input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024–2025" className={fieldClass} />
                </Field>
                <div>
                  <span className={labelClass}>Work type</span>
                  <Select value={workType} onChange={setWorkType} options={WORK_TYPES.map((type) => ({ value: type, label: type }))} className={selectClass} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Role" htmlFor="role">
                  <input id="role" value={role} onChange={(e) => setRole(e.target.value)} className={fieldClass} />
                </Field>
                <Field label="Client (optional)" htmlFor="client">
                  <input id="client" value={client} onChange={(e) => setClient(e.target.value)} className={fieldClass} />
                </Field>
                <Field label="Technologies, separated by commas" htmlFor="technologies">
                  <input id="technologies" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, TypeScript, Tailwind" className={fieldClass} />
                </Field>
                <Field label="Live link (optional)" htmlFor="liveUrl">
                  <input id="liveUrl" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://" className={fieldClass} />
                </Field>
              </div>
              <FieldsEditor fields={sidebarFields} value={rich} onChange={setRich} path="sidebar" />
            </Section>
          </SectionStack>
        )}

        {/* ── Media ────────────────────────────────────────────────────── */}
        {tab === "media" && (
          <SectionStack>
            <Section title="Screenshots" description="The first is the Work page thumbnail; the rest make up the slider.">
              {mode === "edit" && projectId ? (
                <GalleryEditor images={gallery} onChange={setGallery} projectName={name} />
              ) : (
                <p className="text-[12.5px] text-muted-foreground">Screenshots can be uploaded once the case study has been created.</p>
              )}
            </Section>

            <Section title="Logo">
              <LogoField value={logoSrc} onChange={setLogoSrc} />
            </Section>
          </SectionStack>
        )}

        {/* ── Story ────────────────────────────────────────────────────── */}
        {tab === "story" && (
          <div>
              <div className="space-y-3">
                <RichContentEditor value={rich} onChange={setRich} />

                {otherJson.trim() !== "" && (
                  <details className={cardClass}>
                    <summary className="px-5 py-3.5 cursor-pointer text-[13px] font-semibold text-muted-foreground">Advanced: other stored data</summary>
                    <div className="px-5 pb-5">
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
                        className={`${areaClass} font-mono text-[12.5px]`}
                      />
                    </div>
                  </details>
                )}
              </div>
          </div>
        )}
      </div>

      <SaveBar
        dirty={saveState.dirty}
        pending={isPending}
        savedAt={saveState.savedAt}
        error={error}
        saveLabel={mode === "new" ? "Create case study" : "Save changes"}
        viewHref={mode === "edit" && published && slug ? `/work/${slug}` : undefined}
      />
    </form>
  );
}

/** The logo upload: a preview that is also the button, with Remove once there's a logo. */
function LogoField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    uploadProjectLogo(formData)
      .then((result) => {
        if (!result.ok) return setError(result.error ?? "Upload failed.");
        onChange(result.url!);
      })
      .catch(() => setError("Upload failed. Try a smaller file."))
      .finally(() => setUploading(false));
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={value ? "Replace the logo" : "Upload a logo"}
        className="group relative flex h-24 w-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-white transition-colors hover:border-primary/50 disabled:opacity-60"
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-contain p-4" />
            <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 text-[12px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Upload size={13} />
              {uploading ? "Uploading…" : "Replace"}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500 group-hover:text-primary">
            <Upload size={13} />
            {uploading ? "Uploading…" : "Upload SVG or PNG"}
          </span>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/svg+xml,.png,.svg" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
      <div className="space-y-1.5">
        <p className="text-[12px] text-muted-foreground">SVG or PNG with a transparent background.</p>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-[12.5px] font-semibold text-negative hover:underline">
            Remove logo
          </button>
        )}
        {error && <p className="text-[12px] font-medium text-negative" role="alert">{error}</p>}
      </div>
    </div>
  );
}
