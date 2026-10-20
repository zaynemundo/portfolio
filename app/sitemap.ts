import type { MetadataRoute } from "next";
import { getPublishedProjectDates } from "@/app/lib/projects-db";
import { getPublishedPosts } from "@/app/lib/posts-db";
import { SITE_URL as siteUrl } from "@/app/lib/site-url";

/** The most recent of `dates`, or undefined when there are none (so the entry has no date rather than a made-up one). */
function latest(dates: Date[]): Date | undefined {
  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;
}

/* Every date is when that content was last edited, not when the sitemap was
 * fetched, so search engines can tell which pages actually changed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getPublishedProjectDates(), getPublishedPosts()]);
  const projectDates = projects.map((p) => p.updatedAt);
  const postDates = posts.map((p) => new Date(p.updatedAt));

  const staticRoutes: MetadataRoute.Sitemap = [
    // The homepage shows Selected Work and the latest writing, so it changes when they do.
    { url: siteUrl,                lastModified: latest([...projectDates, ...postDates]), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/work`,      lastModified: latest(projectDates),                    changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/insights`,  lastModified: latest(postDates),                       changeFrequency: "weekly",  priority: 0.8 },
  ];

  /* Case-study URLs come from the published projects in the database. */
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/work/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/insights/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
