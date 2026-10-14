/*
 * Describes every long-form case-study section stored in Project.richContent
 * (see app/lib/projects.ts for the shapes, and app/(site)/projects/[slug]/page.tsx
 * for where each one renders). RichContentEditor walks this schema to build
 * the form, so adding a field here is all it takes to make it editable.
 */

export type Field =
  | { kind: "text" | "textarea"; key: string; label: string; placeholder?: string; required?: boolean; half?: boolean }
  /** An image: stored as its URL, picked with an upload button. `captionKey` adds a caption box under it, stored under that key. */
  | { kind: "image"; key: string; label: string; half?: boolean; captionKey?: string; optional?: boolean }
  | { kind: "number"; key: string; label: string; placeholder?: string; half?: boolean }
  | { kind: "lines"; key: string; label: string; placeholder?: string; required?: boolean }
  | { kind: "list"; key: string; label: string; itemLabel: string; fields: Field[]; required?: boolean; /** Short items (metrics, points, before → after): draggable cards this many to a row instead of one per row. */ grid?: 2 | 4; /** Long items (phases, write-ups): a grid of tiles, each edited in a dialog. */ tiles?: boolean }
  | { kind: "group"; key: string; label: string; fields: Field[] };

export interface RichSectionDef {
  id: string;
  title: string;
  /** Where this shows up on the public case study page. */
  hint: string;
  fields: Field[];
  /** No longer shown on the public page. Its content stays stored but the editor leaves it out. */
  retired?: boolean;
  /** Edited somewhere other than the Story tab (the sidebar rows sit with the other details). */
  elsewhere?: boolean;
}

const METRIC_FIELDS: Field[] = [
  { kind: "text", key: "value", label: "Value", placeholder: "+25%", required: true, half: true },
  { kind: "text", key: "label", label: "Label", placeholder: "Sessions after launch", required: true, half: true },
];

const WRITE_UP_FIELDS: Field[] = [
  { kind: "text", key: "title", label: "Title", required: true },
  {
    kind: "list", key: "bullets", label: "Points", itemLabel: "Point", required: true, grid: 2,
    fields: [
      { kind: "text", key: "heading", label: "Heading", required: true },
      { kind: "textarea", key: "body", label: "Body", required: true },
    ],
  },
];

/** A phase of "What I did": a write-up with a picture of the work. */
const PHASE_FIELDS: Field[] = [
  WRITE_UP_FIELDS[0],
  { kind: "image", key: "image", label: "Image", captionKey: "imageCaption", optional: true },
  ...WRITE_UP_FIELDS.slice(1),
];

const METRIC_GROUP_FIELDS: Field[] = [
  { kind: "text", key: "label", label: "Group label", placeholder: "User & Engagement Impact", required: true },
  { kind: "list", key: "metrics", label: "Metrics", itemLabel: "Metric", fields: METRIC_FIELDS, grid: 4, required: true },
];

export const RICH_SECTIONS: RichSectionDef[] = [
  {
    id: "hero",
    title: "Top stats",
    hint: "The figure cards over the cover image. Write the label as “What is counted: the detail”.",
    fields: [{ kind: "list", key: "heroMetrics", label: "Metrics", itemLabel: "Metric", fields: METRIC_FIELDS, grid: 4 }],
  },
  {
    id: "sidebar",
    elsewhere: true,
    title: "Sidebar details",
    hint: "Extra rows in the My role bar under the top stats.",
    fields: [
      { kind: "text", key: "engineeringStack", label: "Stack", placeholder: "Laravel · Vue.js · Custom API", half: true },
      { kind: "text", key: "typography", label: "Typography", placeholder: "Aboreto (Display) · Inter (Body)", half: true },
    ],
  },
  {
    id: "problem",
    title: "The problem",
    hint: "“The problem” chapter: the headline, an intro paragraph under it, then the points. The image shows below the points.",
    fields: [
      { kind: "textarea", key: "problemIntro", label: "Intro paragraph" },
      { kind: "list", key: "problemSections", label: "Problem write-ups", itemLabel: "Write-up", fields: WRITE_UP_FIELDS, tiles: true },
      { kind: "image", key: "resultsImage", label: "Image", captionKey: "resultsImageCaption", optional: true },
    ],
  },
  {
    id: "competitive",
    retired: true,
    title: "Competitive analysis",
    hint: "Benchmark of existing products, shown after The Problem.",
    fields: [
      {
        kind: "group", key: "competitiveAnalysis", label: "Competitive analysis",
        fields: [
          { kind: "text", key: "headline", label: "Headline" },
          { kind: "textarea", key: "intro", label: "Intro" },
          {
            kind: "list", key: "competitors", label: "Competitors", itemLabel: "Competitor", required: true,
            fields: [
              { kind: "text", key: "name", label: "Name", required: true, half: true },
              { kind: "text", key: "category", label: "Category", half: true },
              { kind: "textarea", key: "note", label: "Note" },
            ],
          },
          { kind: "textarea", key: "takeaway", label: "Takeaway" },
        ],
      },
    ],
  },
  {
    id: "research",
    retired: true,
    title: "User research",
    hint: "Ratings, pain points and review quotes.",
    fields: [
      {
        kind: "group", key: "userResearch", label: "User research",
        fields: [
          { kind: "text", key: "headline", label: "Headline" },
          { kind: "textarea", key: "intro", label: "Intro" },
          {
            kind: "list", key: "ratingMetrics", label: "Rating metrics", itemLabel: "Metric",
            fields: [
              { kind: "text", key: "value", label: "Value", placeholder: "2.1★", required: true, half: true },
              { kind: "text", key: "label", label: "Label", placeholder: "App Store rating", required: true, half: true },
            ],
          },
          { kind: "lines", key: "painPoints", label: "Pain points (one per line)" },
          {
            kind: "list", key: "reviews", label: "Review quotes", itemLabel: "Review",
            fields: [
              { kind: "textarea", key: "text", label: "Quote", required: true },
              { kind: "text", key: "author", label: "Author", half: true },
              { kind: "text", key: "source", label: "Source", placeholder: "Google Play", half: true },
              { kind: "text", key: "date", label: "Date", half: true },
              { kind: "number", key: "rating", label: "Rating (1–5)", half: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "wireframes",
    retired: true,
    title: "Wireframes & sketches",
    hint: "Early sketches and iterations.",
    fields: [
      {
        kind: "group", key: "wireframes", label: "Wireframes",
        fields: [
          { kind: "text", key: "headline", label: "Headline" },
          { kind: "textarea", key: "intro", label: "Intro" },
          {
            kind: "list", key: "sketches", label: "Sketches", itemLabel: "Sketch",
            fields: [
              { kind: "text", key: "title", label: "Title", required: true, half: true },
              { kind: "image", key: "image", label: "Image", half: true },
              { kind: "textarea", key: "note", label: "Note" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "flow",
    retired: true,
    title: "User flow",
    hint: "Step-by-step user journey.",
    fields: [
      {
        kind: "group", key: "userFlow", label: "User flow",
        fields: [
          { kind: "text", key: "title", label: "Title", required: true },
          { kind: "textarea", key: "description", label: "Description" },
          {
            kind: "list", key: "steps", label: "Steps", itemLabel: "Step", required: true,
            fields: [
              { kind: "text", key: "step", label: "Step", required: true },
              { kind: "textarea", key: "description", label: "Description" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "transformation",
    title: "The work",
    hint: "“The work” chapter: a numbered timeline, one entry per phase. Each phase can have a picture.",
    fields: [
      { kind: "text", key: "transformationHeadline", label: "Headline", placeholder: "What I changed." },
      { kind: "list", key: "transformationSections", label: "Phases", itemLabel: "Phase", fields: PHASE_FIELDS, tiles: true },
    ],
  },
  {
    id: "execution",
    retired: true,
    title: "What I did: areas of work",
    hint: "The picture cards at the top of the “What I did” chapter: one per area of work, each with tags and an image.",
    fields: [
      { kind: "text", key: "executionHeadline", label: "Headline", placeholder: "Three disciplines. One system." },
      {
        kind: "list", key: "executionDisciplines", label: "Disciplines", itemLabel: "Discipline",
        fields: [
          { kind: "text", key: "name", label: "Name", placeholder: "Frontend Engineering", required: true },
          { kind: "lines", key: "items", label: "Tags (one per line)", required: true },
          { kind: "image", key: "image", label: "Image", captionKey: "visual", optional: true },
        ],
      },
    ],
  },
  {
    id: "deliverables",
    retired: true,
    title: "What was built",
    hint: "Lists of what was delivered, grouped under labels.",
    fields: [
      { kind: "text", key: "deliverablesHeadline", label: "Headline" },
      {
        kind: "list", key: "deliverables", label: "Groups", itemLabel: "Group",
        fields: [
          { kind: "text", key: "label", label: "Group label", required: true },
          { kind: "lines", key: "items", label: "Items (one per line)", required: true },
        ],
      },
    ],
  },
  {
    id: "results",
    title: "The results",
    hint: "“The results” chapter, after The work: before → after for each change, the before/after slider, figures and a closing note.",
    fields: [
      { kind: "text", key: "resultsHeadline", label: "Headline" },
      {
        kind: "list", key: "outcomes", label: "Before → after", itemLabel: "Change", tiles: true,
        fields: [
          { kind: "text", key: "area", label: "What changed", placeholder: "Booking journey", required: true },
          { kind: "text", key: "before", label: "Before", placeholder: "No berth page or onboarding flow", required: true, half: true },
          { kind: "text", key: "after", label: "After", placeholder: "Berth page and a step-by-step process", required: true, half: true },
        ],
      },
      { kind: "list", key: "resultGroups", label: "Result groups", itemLabel: "Group", fields: METRIC_GROUP_FIELDS },
      { kind: "textarea", key: "resultsNote", label: "Closing note (shown only when there are no before → after rows)" },
      {
        kind: "group", key: "compare", label: "Before / after slider (shown once both images are uploaded)",
        fields: [
          { kind: "text", key: "beforeLabel", label: "Before label", placeholder: "2024 — migration", required: true, half: true },
          { kind: "text", key: "afterLabel", label: "After label", placeholder: "2026 — redesign", required: true, half: true },
          { kind: "image", key: "beforeImage", label: "Before image", half: true },
          { kind: "image", key: "afterImage", label: "After image", half: true },
          { kind: "text", key: "caption", label: "Caption" },
        ],
      },
    ],
  },
  {
    id: "performance",
    retired: true,
    title: "Technical performance",
    hint: "“Performance” chapter — a before/after table.",
    fields: [
      {
        kind: "list", key: "performanceAudit", label: "Rows", itemLabel: "Row",
        fields: [
          { kind: "text", key: "metric", label: "Metric", required: true, half: true },
          { kind: "text", key: "status", label: "Status", placeholder: "Fast", required: true, half: true },
          { kind: "text", key: "before", label: "Before", required: true, half: true },
          { kind: "text", key: "after", label: "After", required: true, half: true },
        ],
      },
    ],
  },
  {
    id: "why",
    title: "Why it worked",
    hint: "The dark panel that closes the page. One paragraph per line. The first sentence becomes the headline; the rest become numbered reasons.",
    fields: [{ kind: "lines", key: "whyItWorked", label: "Paragraphs (one per line)" }],
  },
  {
    id: "takeaway",
    retired: true,
    title: "Takeaway",
    hint: "The last line of The thinking panel.",
    fields: [{ kind: "textarea", key: "takeaway", label: "Takeaway" }],
  },
];

/** Every richContent key the structured editor owns. Anything else stays in the "Other data" JSON box. */
export const STRUCTURED_KEYS = new Set(RICH_SECTIONS.flatMap((s) => s.fields.map((f) => f.key)));

/** Same test the public page uses to switch from the simple layout to the long-form one. */
const LONG_FORM_KEYS = [
  "heroMetrics", "problemSections", "transformationSections", "executionDisciplines", "whyItWorked", "takeaway",
];

export function isLongForm(content: Record<string, unknown>): boolean {
  return LONG_FORM_KEYS.some((key) => content[key] !== undefined);
}

function cleanValue(field: Field, value: unknown): unknown {
  switch (field.kind) {
    case "text":
    case "textarea":
    case "image":
      return typeof value === "string" && value.trim() ? value.trim() : undefined;
    case "number": {
      if (value === "" || value === null || value === undefined) return undefined;
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    }
    case "lines": {
      const lines = Array.isArray(value) ? value.map((s) => String(s).trim()).filter(Boolean) : [];
      return lines.length ? lines : undefined;
    }
    case "list": {
      const items = (Array.isArray(value) ? value : [])
        .map((item) => cleanObject(field.fields, item as Record<string, unknown>, true))
        .filter((item) => item !== undefined);
      return items.length ? items : undefined;
    }
    case "group":
      return cleanObject(field.fields, value as Record<string, unknown>, true);
  }
}

/**
 * Drops empty strings, empty lists and empty objects so a blank section is
 * stored as "not there" — the public page decides what to render by whether
 * a key exists at all. If anything in an object survives, its `required`
 * fields are filled with an empty value so the page never reads undefined.
 */
function cleanObject(
  fields: Field[],
  source: Record<string, unknown> | undefined,
  keepUnknown: boolean,
): Record<string, unknown> | undefined {
  const src = source && typeof source === "object" ? source : {};
  const known = new Set(fields.map((f) => f.key));
  const out: Record<string, unknown> = {};

  if (keepUnknown) {
    for (const [key, value] of Object.entries(src)) {
      if (!known.has(key)) out[key] = value;
    }
  }
  for (const field of fields) {
    const cleaned = cleanValue(field, src[field.key]);
    if (cleaned !== undefined) out[field.key] = cleaned;
  }
  if (Object.keys(out).length === 0) return undefined;

  for (const field of fields) {
    if (out[field.key] !== undefined) continue;
    if ((field.kind === "lines" || field.kind === "list") && field.required) out[field.key] = [];
    if ((field.kind === "text" || field.kind === "textarea") && field.required) out[field.key] = "";
  }
  return out;
}

/** The structured part of richContent, ready to save. */
export function cleanRichContent(content: Record<string, unknown>): Record<string, unknown> {
  const fields = RICH_SECTIONS.flatMap((s) => s.fields);
  return cleanObject(fields, content, false) ?? {};
}

/** Whether a section has anything saved in it — drives the "filled" marker. */
export function sectionHasContent(section: RichSectionDef, content: Record<string, unknown>): boolean {
  return cleanObject(section.fields, content, false) !== undefined;
}
