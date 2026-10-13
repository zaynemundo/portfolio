"use client";

import { useMemo, useState, useTransition } from "react";
import { createProject, updateProject, type ProjectFormData } from "@/app/actions/projects";
import { ImageManager } from "./ImageManager";
import { RichContentEditor, FieldsEditor } from "./RichContentEditor";
import { RICH_SECTIONS, STRUCTURED_KEYS, cleanRichContent, isLongForm } from "./rich-schema";
import { SaveBar, useSaveState, useUnsavedWarning } from "@/app/(admin)/_components/SaveBar";
import { cardClass, tabBarClass, tabClass } from "@/app/(admin)/_components/ui/Card";
import { Switch } from "@/app/(admin)/_components/ui/Switch";
import { Select } from "@/app/(admin)/_components/Select";
import { Section, SectionStack, Field, fieldClass, areaClass, labelClass } from "@/app/(admin)/_components/Section";

interface Props {
  mode: "new" | "edit";
  projectId?: string;
  images?: string[];
  initial?: Partial<ProjectFormData>;
}

type Obj = Record<string, unknown>;

type Tab = "basics" | "media" | "story";
const TABS: { id: Tab; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "media", label: "Media" },
  { id: "story", label: "Story" },
];

type Story = "detailed" | "simple";
const STORIES: { id: Story; label: string }[] = [
  { id: "detailed", label: "Detailed" },
  { id: "simple", label: "Simple" },
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

  const [tab, setTab] = useState<Tab>("basics");
  // Opens on whichever write-up the public page is using; a new case study starts on the detailed one.
  const [story, setStory] = useState<Story>(() =>
    isLongForm(cleanRichContent(initialRich.structured)) || !(initial?.challenge || initial?.approach || initial?.outcome) ? "detailed" : "simple",
  );

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
          <label htmlFor="slug" className="font-mono text-[12.5px] text-muted-foreground/70 shrink-0">/projects/</label>
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
            <Section title="Summary" description="The line under the title at the top of the case study, and the short text on project cards across the site.">
              <Field label="Tagline" htmlFor="tagline">
                <textarea id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2} className={areaClass} />
              </Field>
              <Field label="Short description" htmlFor="shortDescription">
                <textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className={areaClass} />
              </Field>
            </Section>

            <Section title="Visibility" description="A draft is only visible to you. Featured case studies can be picked for Selected Work on the homepage.">
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

            <Section title="Details" description="The Details sidebar on the case study, and the labels on project cards.">
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
            <Section title="Screenshots" description="The image slider at the top of the case study. Captions go with the screenshots in order.">
              {mode === "edit" && projectId ? (
                <ImageManager projectId={projectId} images={images} />
              ) : (
                <p className="text-[12.5px] text-muted-foreground">Screenshots can be uploaded once the case study has been created.</p>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Captions, one per line" htmlFor="imageLabels">
                  <textarea id="imageLabels" value={imageLabels} onChange={(e) => setImageLabels(e.target.value)} rows={4} placeholder={"Homepage\nProduct Listing\nProduct Detail"} className={areaClass} />
                </Field>
                <Field label="Image description" htmlFor="imageAlt" hint="Read out by screen readers and shown if an image fails to load.">
                  <input id="imageAlt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} className={fieldClass} />
                </Field>
              </div>
            </Section>

            <Section title="Card and logo" description="The tint behind this project's card, and the small client logo tile shown with it.">
              <div className="grid sm:grid-cols-2 gap-4">
                <ColorField label="Card background" id="themeBg" value={themeBg} onChange={setThemeBg} />
                <ToggleField label="Text on the card" on={themeDark} onChange={setThemeDark} onText="Light text, for a dark background" offText="Dark text, for a light background" />
                <ColorField label="Logo tile background" id="logoBg" value={logoBg} onChange={setLogoBg} />
                <ToggleField label="Initials on the tile" on={logoLight} onChange={setLogoLight} onText="Light initials, for a dark tile" offText="Dark initials, for a light tile" />
                <Field label="Logo initials" htmlFor="logoInitials">
                  <input id="logoInitials" value={logoInitials} onChange={(e) => setLogoInitials(e.target.value)} placeholder="ZM" className={fieldClass} />
                </Field>
                <Field label="Logo image link (optional)" htmlFor="logoSrc" hint="Used instead of the initials.">
                  <input id="logoSrc" value={logoSrc} onChange={(e) => setLogoSrc(e.target.value)} className={fieldClass} />
                </Field>
              </div>
            </Section>
          </SectionStack>
        )}

        {/* ── Story ────────────────────────────────────────────────────── */}
        {tab === "story" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-card p-1" role="tablist" aria-label="Write-up">
                {STORIES.map((option) => (
                  <button key={option.id} type="button" role="tab" aria-selected={story === option.id} onClick={() => setStory(option.id)} className={tabClass(story === option.id)}>
                    {option.label}
                    {(option.id === "detailed") === longForm && <span className="ml-1.5 font-medium opacity-60">· on the site</span>}
                  </button>
                ))}
              </div>
              <p className="min-w-0 flex-1 text-[12.5px] text-muted-foreground">
                {longForm
                  ? "The public page shows the detailed write-up. The simple one is kept but not displayed."
                  : "The public page shows the simple write-up. It switches to the detailed one as soon as a detailed chapter has content."}
              </p>
            </div>

            {story === "detailed" ? (
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
            ) : (
              <SectionStack>
                <Section title="The write-up" description="Challenge, Approach and Outcome are needed on every case study, even one that uses the detailed write-up.">
                  <Field label="Challenge" htmlFor="challenge">
                    <textarea id="challenge" value={challenge} onChange={(e) => setChallenge(e.target.value)} rows={4} className={areaClass} />
                  </Field>
                  <Field label="Approach" htmlFor="approach">
                    <textarea id="approach" value={approach} onChange={(e) => setApproach(e.target.value)} rows={4} className={areaClass} />
                  </Field>
                  <Field label="Key contributions, one per line" htmlFor="highlights">
                    <textarea id="highlights" value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={4} className={areaClass} />
                  </Field>
                  <Field label="Outcome" htmlFor="outcome">
                    <textarea id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={3} className={areaClass} />
                  </Field>
                </Section>

                <Section title="Optional notes" description="Short extra paragraphs. Leave any of them empty to leave it off the page.">
                  <Field label="Accessibility" htmlFor="accessibility">
                    <textarea id="accessibility" value={accessibility} onChange={(e) => setAccessibility(e.target.value)} rows={2} className={areaClass} />
                  </Field>
                  <Field label="Performance" htmlFor="performance">
                    <textarea id="performance" value={performance} onChange={(e) => setPerformance(e.target.value)} rows={2} className={areaClass} />
                  </Field>
                  <Field label="SEO" htmlFor="seo">
                    <textarea id="seo" value={seo} onChange={(e) => setSeo(e.target.value)} rows={2} className={areaClass} />
                  </Field>
                </Section>
              </SectionStack>
            )}
          </div>
        )}
      </div>

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

/** A colour as a swatch that opens the colour picker, with its code beside it for pasting an exact value. */
function ColorField({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (value: string) => void }) {
  // The picker only understands six-digit codes; anything else still shows in the text box.
  const pickable = /^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff";
  return (
    <Field label={label} htmlFor={id}>
      <div className={`${fieldClass} flex items-center gap-2.5`}>
        <input
          type="color"
          value={pickable}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label}: pick a colour`}
          className="h-6 w-6 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
        />
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[13px] text-foreground focus:outline-none" />
      </div>
    </Field>
  );
}

/** An on/off choice shown as a field: what it is currently set to on the left, the switch on the right. */
function ToggleField({ label, on, onChange, onText, offText }: { label: string; on: boolean; onChange: (on: boolean) => void; onText: string; offText: string }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className={`${fieldClass} flex items-center justify-between gap-3`}>
        <span className="min-w-0 truncate">{on ? onText : offText}</span>
        <Switch checked={on} onCheckedChange={onChange} aria-label={label} />
      </div>
    </div>
  );
}
