"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function getAll(data: FormData, key: string): string[] {
  return (data.getAll(key) as string[]).map((s) => s.trim()).filter(Boolean);
}

function get(data: FormData, key: string): string {
  return ((data.get(key) as string) ?? "").trim();
}

function parseLines(val: string): string[] {
  return val.split("\n").map((s) => s.trim()).filter(Boolean);
}

/** Split "Heading | Body" into its two halves. Body is "" when no pipe. */
function splitPair(line: string): { heading: string; body: string } {
  const idx = line.indexOf("|");
  return idx === -1
    ? { heading: line.trim(), body: "" }
    : { heading: line.slice(0, idx).trim(), body: line.slice(idx + 1).trim() };
}

/**
 * Parse "# Block title" sections into { title, lines }.
 * Everything until the next "# " belongs to the current block.
 */
function parseBlocks(raw: string): { title: string; lines: string[] }[] {
  return raw
    .split(/^#\s+/m)
    .filter((b) => b.trim())
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      return { title: lines[0] ?? "", lines: lines.slice(1) };
    })
    .filter((b) => b.title);
}

/* ── Rich content JSON builder ────────────────────────────────────────────── */
function buildRichContentJson(data: FormData, roleTags: string[]): string | null {
  const rich: Record<string, unknown> = {};

  // Disciplines — derived from role tags
  if (roleTags.length) rich.disciplines = roleTags;

  // Hero metrics — 3 value+label pairs
  const heroMetrics = [0, 1, 2]
    .map((i) => ({
      value: get(data, `rich_metric_value_${i}`),
      label: get(data, `rich_metric_label_${i}`),
    }))
    .filter((m) => m.value && m.label);
  if (heroMetrics.length) rich.heroMetrics = heroMetrics;

  // Secondary stat clusters — "# Group" then "Value | Meaning"
  const metricGroups = parseBlocks(get(data, "rich_metricGroups")).map((b) => ({
    label: b.title,
    metrics: b.lines.map(splitPair)
      .filter((m) => m.heading)
      .map((m) => ({ value: m.heading, label: m.body })),
  })).filter((g) => g.metrics.length);
  if (metricGroups.length) rich.metricGroups = metricGroups;

  // Slide captions — one per uploaded image, paired by index (blanks preserved)
  const imageLabels = (data.getAll("imageLabels") as string[]).map((s) => s.trim());
  if (imageLabels.some(Boolean)) rich.imageLabels = imageLabels;

  // Client logo — uploaded file and/or the initials tile fallback
  const logoSrc      = get(data, "rich_logoSrc");
  const logoInitials = get(data, "rich_logoInitials");
  const logoBg       = get(data, "rich_logoBg");
  const logoLight    = data.get("rich_logoLight") === "true";
  if (logoSrc || logoInitials || logoBg) {
    rich.logo = {
      ...(logoSrc      ? { src: logoSrc }           : {}),
      ...(logoInitials ? { initials: logoInitials } : {}),
      ...(logoBg       ? { bg: logoBg }             : {}),
      ...(logoLight    ? { light: true }            : {}),
    };
  }

  // Accent colour used for image placeholders and the project card
  const themeBg = get(data, "rich_themeBg");
  if (themeBg) {
    rich.theme = { bg: themeBg, ...(data.get("rich_themeDark") === "true" ? { dark: true } : {}) };
  }

  // Context
  const client           = get(data, "rich_client");
  const engineeringStack = get(data, "rich_engineeringStack");
  const typography       = get(data, "rich_typography");
  if (client)           rich.client           = client;
  if (engineeringStack) rich.engineeringStack = engineeringStack;
  if (typography)       rich.typography       = typography;

  // The Problem section
  const problemTitle   = get(data, "rich_problemTitle");
  const problemIntro   = get(data, "rich_problemIntro");
  const problemBullets = parseLines(get(data, "rich_problemBullets"))
    .map(splitPair).filter((b) => b.heading);
  if (problemTitle) {
    rich.problemSections = [{ title: problemTitle, bullets: problemBullets }];
  }
  if (problemIntro) rich.problemIntro = problemIntro;

  // Compare before/after
  const compareBeforeLabel = get(data, "rich_compareBeforeLabel");
  const compareAfterLabel  = get(data, "rich_compareAfterLabel");
  const compareCaption     = get(data, "rich_compareCaption");
  const compareBeforeImage = get(data, "rich_compareBeforeImage");
  const compareAfterImage  = get(data, "rich_compareAfterImage");
  if (compareBeforeLabel || compareAfterLabel) {
    rich.compare = {
      beforeLabel: compareBeforeLabel,
      afterLabel:  compareAfterLabel,
      ...(compareCaption     ? { caption: compareCaption }          : {}),
      ...(compareBeforeImage ? { beforeImage: compareBeforeImage }  : {}),
      ...(compareAfterImage  ? { afterImage: compareAfterImage }    : {}),
    };
  }

  // Transformation sections — "# Title" then "Heading | Body" lines
  const transformationSections = parseBlocks(get(data, "rich_transformation")).map((b) => ({
    title: b.title,
    bullets: b.lines.map(splitPair).filter((x) => x.heading),
  }));
  if (transformationSections.length) rich.transformationSections = transformationSections;

  // Execution disciplines — "# Name", "- item" lines, and an optional "> visual caption"
  const executionDisciplines = parseBlocks(get(data, "rich_execution")).map((b) => ({
    name:   b.title,
    items:  b.lines
      .filter((l) => !l.startsWith(">") && !l.startsWith("!"))
      .map((l) => l.replace(/^-\s*/, "").trim())
      .filter(Boolean),
    visual: b.lines.find((l) => l.startsWith(">"))?.replace(/^>\s*/, "").trim() || undefined,
    image:  b.lines.find((l) => l.startsWith("!"))?.replace(/^!\s*/, "").trim() || undefined,
  }));
  if (executionDisciplines.length) rich.executionDisciplines = executionDisciplines;

  // Section headlines
  const transformationHeadline = get(data, "rich_transformationHeadline");
  const executionHeadline      = get(data, "rich_executionHeadline");
  const resultsHeadline        = get(data, "rich_resultsHeadline");
  if (transformationHeadline) rich.transformationHeadline = transformationHeadline;
  if (executionHeadline)      rich.executionHeadline      = executionHeadline;
  if (resultsHeadline)        rich.resultsHeadline        = resultsHeadline;

  // Final results — "# Group" then "Value | Meaning"
  const resultGroups = parseBlocks(get(data, "rich_resultGroups")).map((b) => ({
    label: b.title,
    metrics: b.lines.map(splitPair)
      .filter((m) => m.heading)
      .map((m) => ({ value: m.heading, label: m.body })),
  })).filter((g) => g.metrics.length);
  if (resultGroups.length) rich.resultGroups = resultGroups;

  const resultsNote = get(data, "rich_resultsNote");
  if (resultsNote) rich.resultsNote = resultsNote;

  const resultsImage        = get(data, "rich_resultsImage");
  const resultsImageCaption = get(data, "rich_resultsImageCaption");
  if (resultsImage)        rich.resultsImage        = resultsImage;
  if (resultsImageCaption) rich.resultsImageCaption = resultsImageCaption;

  // What was built — "# Group" then "- item"
  const deliverables = parseBlocks(get(data, "rich_deliverables")).map((b) => ({
    label: b.title,
    items: b.lines.map((l) => l.replace(/^-\s*/, "").trim()).filter(Boolean),
  })).filter((d) => d.items.length);
  if (deliverables.length) rich.deliverables = deliverables;

  const deliverablesHeadline = get(data, "rich_deliverablesHeadline");
  if (deliverablesHeadline) rich.deliverablesHeadline = deliverablesHeadline;

  // Before/after audit table — "Metric | Before | After | Status" per line
  const performanceAudit = parseLines(get(data, "rich_audit")).map((line) => {
    const [metric, before, after, status] = line.split("|").map((s) => s.trim());
    return { metric, before, after, status };
  }).filter((r) => r.metric);
  if (performanceAudit.length) rich.performanceAudit = performanceAudit;

  // Why it worked — blank lines separate paragraphs
  const whyItWorked = get(data, "rich_whyItWorked");
  const takeaway    = get(data, "rich_takeaway");
  if (whyItWorked) {
    rich.whyItWorked = whyItWorked.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }
  if (takeaway) rich.takeaway = takeaway;

  return Object.keys(rich).length ? JSON.stringify(rich) : null;
}

/* ── Core data builder ────────────────────────────────────────────────────── */
function projectFromForm(data: FormData) {
  const name     = get(data, "name");
  const tagline  = get(data, "tagline");
  const roleTags = getAll(data, "role");

  // Auto-generate fallback values for legacy DB fields (not shown in form)
  const problemTitle = get(data, "rich_problemTitle");
  const whyItWorked  = get(data, "rich_whyItWorked");
  const takeaway     = get(data, "rich_takeaway");

  return {
    slug:             get(data, "slug"),
    name,
    tagline,
    shortDescription: get(data, "shortDescription"),
    role:             roleTags.join(" · ") || get(data, "role"),
    category:         getAll(data, "category").join(" · ") || get(data, "category"),
    year:             get(data, "year"),
    technologies:     getAll(data, "technologies"),
    // Legacy fields — kept in DB but auto-populated from rich content
    challenge:        problemTitle || tagline,
    approach:         whyItWorked  || "See project case study",
    outcome:          takeaway     || "See project case study",
    highlights:       [],
    accessibility:    null,
    performance:      null,
    seo:              null,
    imageAlt:         `${name} — ${tagline}`,
    liveUrl:          get(data, "liveUrl") || null,
    workType:         get(data, "workType") || "Freelance",
    published:        data.get("published") === "true",
    richContentJson:  buildRichContentJson(data, roleTags),
    images:           getAll(data, "images"),
  };
}

/* ── Actions ──────────────────────────────────────────────────────────────── */

/*
 * The case study route is statically generated per slug, so it has to be
 * revalidated by path alongside the listing — otherwise an edit lands in the
 * database but the public page keeps serving the previously built HTML.
 */
function revalidateProject(slug?: string) {
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function createProject(data: FormData) {
  // Auto-increment sortOrder
  const last = await prisma.project.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? -1) + 1;
  const project = await prisma.project.create({ data: { ...projectFromForm(data), sortOrder } });
  revalidateProject(project.slug);
  redirect("/admin/projects");
}

export async function updateProject(id: string, data: FormData) {
  // The slug may have changed — refresh the old path too so it stops serving stale HTML.
  const previous = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
  const project = await prisma.project.update({ where: { id }, data: projectFromForm(data) });
  if (previous && previous.slug !== project.slug) revalidatePath(`/projects/${previous.slug}`);
  revalidateProject(project.slug);
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  const project = await prisma.project.delete({ where: { id } });
  revalidateProject(project.slug);
}

export async function toggleProjectPublished(id: string, published: boolean) {
  const project = await prisma.project.update({ where: { id }, data: { published } });
  revalidateProject(project.slug);
}
