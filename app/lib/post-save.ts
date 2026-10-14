import { prisma } from "@/app/lib/prisma";
import {
  formatPostDate,
  isIsoDay,
  localToday,
  publishProblems,
  publishProblemsMessage,
  readTimeFor,
  slugify,
  type PostFormData,
} from "@/app/lib/post-meta";

export type PostSaveResult =
  | { ok: false; error: string }
  | {
      ok: true;
      id: string;
      slug: string;
      date: string;
      dateFormatted: string;
      readTime: string;
      /** The article was live before this save or is live after it — the public pages need refreshing. */
      touchesPublicSite: boolean;
    };

/**
 * A draft that has never been live still carries the timestamp it was created
 * with as its date. Publishing stamps a real date over it, so an article that
 * was published once and later pulled back keeps that date when it returns.
 */
function neverPublished(post: { published: boolean; date: Date; createdAt: Date }): boolean {
  return !post.published && Math.abs(post.date.getTime() - post.createdAt.getTime()) < 60_000;
}

function toDate(isoDay: string): Date {
  return new Date(`${isoDay}T12:00:00Z`);
}

/**
 * The one way an article is written to the database — creating it (id null)
 * or updating it. Drafts only need a title, so they can be saved as they're
 * typed; going live needs everything the public page shows. Callers do their
 * own cache invalidation, since that differs between actions and routes.
 */
export async function savePost(id: string | null, data: PostFormData): Promise<PostSaveResult> {
  const existing = id ? await prisma.blogPost.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "This article no longer exists." };

  if (data.published) {
    const missing = publishProblems(data);
    if (missing.length > 0) return { ok: false, error: publishProblemsMessage(missing) };
  } else if (!data.title.trim()) {
    return { ok: false, error: "Add a title to save this draft." };
  }

  const slug = slugify(data.slug || data.title) || existing?.slug || `untitled-${Date.now().toString(36)}`;
  const clash = await prisma.blogPost.findUnique({ where: { slug } });
  if (clash && clash.id !== existing?.id) {
    return { ok: false, error: `Another article already uses the address /insights/${slug}. Change it under Search.` };
  }

  const requestedDay = isIsoDay(data.date) ? data.date : localToday();
  let day: string | null = null;
  if (data.published) {
    if (!existing || neverPublished(existing)) day = requestedDay;
    else if (existing.published && requestedDay !== existing.date.toISOString().slice(0, 10)) day = requestedDay;
  }

  const fields = {
    slug,
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    contentHtml: data.contentHtml,
    category: data.category.trim(),
    readTime: readTimeFor(data.contentHtml),
    featured: data.featured,
    published: data.published,
    ...(day ? { date: toDate(day), dateFormatted: formatPostDate(day) } : {}),
  };

  const post = existing
    ? await prisma.blogPost.update({ where: { id: existing.id }, data: fields })
    : await prisma.blogPost.create({
        data: { ...fields, dateFormatted: fields.dateFormatted ?? formatPostDate(requestedDay) },
      });

  return {
    ok: true,
    id: post.id,
    slug: post.slug,
    date: post.date.toISOString().slice(0, 10),
    dateFormatted: post.dateFormatted,
    readTime: post.readTime,
    touchesPublicSite: data.published || (existing?.published ?? false),
  };
}
