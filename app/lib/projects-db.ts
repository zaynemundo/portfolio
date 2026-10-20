/*
 * Project reads — database-backed.
 *
 * A Project row's scalar columns cover the fields every card/listing
 * needs; `richContent` carries the long tail of optional case-study
 * sections (see app/lib/projects.ts) as JSON. rowToProject() merges
 * the two into the full Project shape pages render.
 */

import { prisma } from "@/app/lib/prisma";
import type { Project } from "@/app/lib/projects";
import type { ProjectCard } from "@/app/lib/projects";

type ProjectRow = Awaited<ReturnType<typeof prisma.project.findMany>>[number];

function rowToProject(row: ProjectRow): Project {
  const rich = (row.richContent ?? {}) as Record<string, unknown>;
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    shortDescription: row.shortDescription,
    role: row.role,
    category: row.category,
    year: row.year,
    workType: row.workType ?? undefined,
    technologies: row.technologies,
    challenge: row.challenge,
    approach: row.approach,
    outcome: row.outcome,
    highlights: row.highlights,
    accessibility: row.accessibility ?? undefined,
    performance: row.performance ?? undefined,
    seo: row.seo ?? undefined,
    imageAlt: row.imageAlt,
    liveUrl: row.liveUrl ?? undefined,
    client: row.client ?? undefined,
    images: row.images,
    imageLabels: row.imageLabels,
    imageAlts: row.imageAlts,
    theme: row.theme as Project["theme"],
    logo: row.logo as Project["logo"],
    ...rich,
  } as Project;
}

function rowToCard(row: ProjectRow): ProjectCard {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: row.category,
    year: row.year,
    technologies: row.technologies,
    role: row.role,
    workType: row.workType ?? undefined,
    images: row.images,
    imageAlt: row.imageAlt,
    liveUrl: row.liveUrl,
    theme: row.theme as ProjectCard["theme"],
    logo: row.logo as ProjectCard["logo"],
    client: row.client ?? undefined,
    videoMp4: row.videoMp4 ?? undefined,
    videoWebm: row.videoWebm ?? undefined,
    poster: row.poster ?? undefined,
  };
}

/** Published projects as lightweight cards, in display order. */
export async function getPublishedProjectCards(): Promise<ProjectCard[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(rowToCard);
}

/** One published project by slug, or null if not found. */
export async function getPublishedProject(slug: string): Promise<Project | null> {
  const row = await prisma.project.findFirst({ where: { slug, published: true } });
  return row ? rowToProject(row) : null;
}

/** Slug + name of every published project, in display order. */
export async function getPublishedProjectIndex(): Promise<{ slug: string; name: string }[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });
  return rows;
}

/** Slug + last edit of every published project, for the sitemap. */
export async function getPublishedProjectDates(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, updatedAt: true },
  });
}

/** Slugs of published projects flagged "Featured" (the homepage's Selected Work). */
export async function getFeaturedProjectSlugs(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
