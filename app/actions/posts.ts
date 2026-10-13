"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { savePost } from "@/app/lib/post-save";

export interface PostActionResult {
  ok: boolean;
  error?: string;
}

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

export async function deletePost(id: string): Promise<void> {
  await requireSession();
  await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  revalidatePublicPages();
  revalidatePath("/write-ups");
  updateTag(CACHE_TAGS.blog);
}

/** The Published/Draft switch on the Blog list. Saving the article itself goes through app/(admin)/write-ups/save. */
export async function togglePublished(id: string, published: boolean): Promise<PostActionResult> {
  await requireSession();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { ok: false, error: "This article no longer exists." };

  const result = await savePost(id, {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    featured: post.featured,
    contentHtml: post.contentHtml,
    published,
    // Already-live articles keep their date; a first publish is stamped with today.
    date: post.published ? post.date.toISOString().slice(0, 10) : "",
  });
  if (!result.ok) return result;

  revalidatePublicPages();
  revalidatePath("/write-ups");
  updateTag(CACHE_TAGS.blog);
  return { ok: true };
}

export interface ImageUploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Uploads an image dropped/inserted into a post's rich-text content — not tied to a specific post row, just Blob storage. */
export async function uploadPostImage(formData: FormData): Promise<ImageUploadResult> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "File is too large (max 10MB)." };

  const blob = await put(`posts/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { ok: true, url: blob.url };
}
