/*
 * Project reads — the database is the only source of project content.
 *
 * A Project row stores the common fields as columns and everything else — the
 * rich case-study sections, theme, logo, per-slot images — as a JSON payload in
 * `richContentJson`. Every page reassembles them the same way, so that mapping
 * lives here rather than being repeated per page.
 *
 * There is no static fallback. If the database is unreachable these return
 * empty/null and the pages render as if nothing were published, which is
 * honest: a stale hardcoded copy would silently contradict the admin.
 */

import { prisma } from "@/app/lib/prisma";
import type { Project } from "@/app/lib/projects";
import { staticFullProjects } from "@/app/lib/projects-full-static";

/** The columns every read needs; the rest of a Project comes from richContentJson. */
type ProjectRow = {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  role: string;
  category: string;
  year: string;
  workType: string | null;
  technologies: string[];
  challenge: string;
  approach: string;
  outcome: string;
  highlights: string[];
  accessibility: string | null;
  performance: string | null;
  seo: string | null;
  imageAlt: string;
  liveUrl: string | null;
  images: string[];
  richContentJson: string | null;
};

/*
 * The admin form stores "Why it worked" as one blob of text; the field renders
 * as separate paragraphs. Normalise either shape to paragraphs — blank lines
 * separate them.
 */
function toParagraphs(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value.trim()) {
    return value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  }
  return undefined;
}

/** Reassemble a full Project from its row and rich-content payload. */
function rowToProject(row: ProjectRow): Project {
  const raw = row.richContentJson
    ? (JSON.parse(row.richContentJson) as Partial<Project> & { compareSection?: Project["compare"] })
    : {};
  const { compareSection, ...rich } = raw;

  return {
    slug:             row.slug,
    name:             row.name,
    tagline:          row.tagline,
    shortDescription: row.shortDescription,
    role:             row.role,
    category:         row.category,
    year:             row.year,
    workType:         row.workType ?? undefined,
    technologies:     row.technologies,
    challenge:        row.challenge,
    approach:         row.approach,
    outcome:          row.outcome,
    highlights:       row.highlights,
    accessibility:    row.accessibility ?? undefined,
    performance:      row.performance ?? undefined,
    seo:              row.seo ?? undefined,
    imageAlt:         row.imageAlt,
    liveUrl:          row.liveUrl ?? undefined,
    images:           row.images,
    ...rich,
    // `compareSection` is the older key the admin form used to write.
    compare:      rich.compare ?? compareSection,
    whyItWorked:  toParagraphs(rich.whyItWorked),
  };
}

/** Every published project, in admin sort order. Empty if the DB is unreachable. */
export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(rowToProject);
  } catch {
    return [];
  }
}

/** One published project by slug, or null if missing or the DB is unreachable. */
export async function getPublishedProject(slug: string): Promise<Project | null> {
  try {
    const row = await prisma.project.findUnique({ where: { slug, published: true } });
    if (row) return rowToProject(row);
  } catch { /* DB unavailable */ }
  // Static fallback — used when DB is empty or unreachable
  return staticFullProjects.find((p) => p.slug === slug) ?? null;
}

/**
 * Slug + name of every published project, in sort order.
 *
 * Enough to build the static params and the prev/next links without loading
 * ten full case studies to render two labels.
 */
export async function getPublishedProjectIndex(): Promise<{ slug: string; name: string }[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    });
    if (rows.length) return rows;
  } catch { /* DB unavailable */ }
  // Static fallback
  return staticFullProjects.map(({ slug, name }) => ({ slug, name }));
}
