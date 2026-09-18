/*
 * Project reads — static data source.
 *
 * These functions provide the same interface used by pages, backed by
 * the static full-project data. Replace with a database adapter when ready.
 */

import type { Project } from "@/app/lib/projects";
import { staticFullProjects } from "@/app/lib/projects-full-static";

/** Every published project, in order. */
export async function getPublishedProjects(): Promise<Project[]> {
  return staticFullProjects;
}

/** One project by slug, or null if not found. */
export async function getPublishedProject(slug: string): Promise<Project | null> {
  return staticFullProjects.find((p) => p.slug === slug) ?? null;
}

/** Slug + name of every project, in order. */
export async function getPublishedProjectIndex(): Promise<{ slug: string; name: string }[]> {
  return staticFullProjects.map(({ slug, name }) => ({ slug, name }));
}
