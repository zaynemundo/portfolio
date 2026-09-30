"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  contentHtml: string;
}

export interface PostActionResult {
  ok: boolean;
  error?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validate(data: PostFormData): string | null {
  if (!data.title.trim()) return "Title is required.";
  if (!data.excerpt.trim()) return "Excerpt is required.";
  if (!data.category.trim()) return "Category is required.";
  if (!data.readTime.trim()) return "Read time is required.";
  if (!data.contentHtml.trim() || data.contentHtml === "<p></p>") return "Content can't be empty.";
  return null;
}

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

export async function createPost(data: PostFormData): Promise<PostActionResult> {
  await requireSession();

  const error = validate(data);
  if (error) return { ok: false, error };

  const slug = slugify(data.slug || data.title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: `A post with slug "${slug}" already exists.` };

  const now = new Date();
  await prisma.blogPost.create({
    data: {
      slug,
      title: data.title.trim(),
      excerpt: data.excerpt.trim(),
      contentHtml: data.contentHtml,
      category: data.category.trim(),
      readTime: data.readTime.trim(),
      featured: data.featured,
      published: data.published,
      date: now,
      dateFormatted: now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    },
  });

  revalidatePublicPages();
  updateTag(CACHE_TAGS.blog);
  redirect("/write-ups");
}

export async function updatePost(id: string, data: PostFormData): Promise<PostActionResult> {
  await requireSession();

  const error = validate(data);
  if (error) return { ok: false, error };

  const slug = slugify(data.slug || data.title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { ok: false, error: `A post with slug "${slug}" already exists.` };
  }

  await prisma.blogPost.update({
    where: { id },
    data: {
      slug,
      title: data.title.trim(),
      excerpt: data.excerpt.trim(),
      contentHtml: data.contentHtml,
      category: data.category.trim(),
      readTime: data.readTime.trim(),
      featured: data.featured,
      published: data.published,
    },
  });

  revalidatePublicPages();
  updateTag(CACHE_TAGS.blog);
  redirect("/write-ups");
}

export async function deletePost(id: string): Promise<void> {
  await requireSession();
  await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  revalidatePublicPages();
  revalidatePath("/write-ups");
  updateTag(CACHE_TAGS.blog);
}

export async function togglePublished(id: string, published: boolean): Promise<void> {
  await requireSession();
  await prisma.blogPost.update({ where: { id }, data: { published } });
  revalidatePublicPages();
  revalidatePath("/write-ups");
  updateTag(CACHE_TAGS.blog);
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
