import { prisma } from "@/app/lib/prisma";
import type { Post, PostSummary } from "@/app/lib/posts";

function toPost(row: {
  id: string; slug: string; title: string; excerpt: string; contentHtml: string;
  category: string; readTime: string; featured: boolean; published: boolean;
  date: Date; dateFormatted: string;
}): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentHtml: row.contentHtml,
    category: row.category,
    readTime: row.readTime,
    featured: row.featured,
    published: row.published,
    date: row.date.toISOString().slice(0, 10),
    dateFormatted: row.dateFormatted,
  };
}

/** Published posts, newest first — for the public site. */
export async function getPublishedPosts(): Promise<PostSummary[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    select: {
      id: true, slug: true, title: true, excerpt: true, category: true,
      readTime: true, featured: true, published: true, date: true, dateFormatted: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category,
    readTime: r.readTime,
    featured: r.featured,
    published: r.published,
    date: r.date.toISOString().slice(0, 10),
    dateFormatted: r.dateFormatted,
  }));
}

/** One published post by slug, or null. */
export async function getPublishedPost(slug: string): Promise<Post | null> {
  const row = await prisma.blogPost.findFirst({ where: { slug, published: true } });
  return row ? toPost(row) : null;
}

/** Slugs of every published post — for static params / sitemap. */
export async function getPublishedPostSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
