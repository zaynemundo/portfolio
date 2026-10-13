import { revalidatePath, revalidateTag } from "next/cache";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { savePost } from "@/app/lib/post-save";
import type { PostFormData } from "@/app/lib/post-meta";

/**
 * Saves an article from the writing screen — every autosave of a draft and
 * every Publish / Save click.
 *
 * This is a route, not a Server Action, on purpose: an action that
 * invalidates a cache also re-renders the page it was called from, which
 * would rebuild the editor under the cursor every couple of seconds. A plain
 * request can expire the same caches without touching the open page.
 */
export async function POST(request: Request) {
  await requireSession();

  let body: { id?: string | null; data?: PostFormData };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Nothing to save." }, { status: 400 });
  }
  const data = body.data;
  if (
    !data ||
    typeof data.title !== "string" ||
    typeof data.slug !== "string" ||
    typeof data.excerpt !== "string" ||
    typeof data.category !== "string" ||
    typeof data.contentHtml !== "string" ||
    typeof data.date !== "string"
  ) {
    return Response.json({ ok: false, error: "Nothing to save." }, { status: 400 });
  }

  const result = await savePost(typeof body.id === "string" ? body.id : null, {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    category: data.category,
    contentHtml: data.contentHtml,
    date: data.date,
    featured: data.featured === true,
    published: data.published === true,
  });
  if (!result.ok) return Response.json(result);

  // Expire now rather than serve-stale: reopening a draft must show what was just typed.
  revalidateTag(CACHE_TAGS.blog, { expire: 0 });
  if (result.touchesPublicSite) {
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/sitemap.xml");
  }

  return Response.json(result);
}
