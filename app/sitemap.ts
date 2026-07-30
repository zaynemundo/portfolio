import type { MetadataRoute } from "next";
import { getPublishedProjectIndex } from "@/app/lib/projects-db";
import { posts } from "@/app/lib/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zairamundo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl,                   lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/blog`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${siteUrl}/about`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.7 },
  ];

  /* Case-study URLs come from the published projects in the database. */
  const projectRoutes: MetadataRoute.Sitemap = (await getPublishedProjectIndex()).map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
