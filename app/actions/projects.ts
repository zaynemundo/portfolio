"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { Prisma } from "@/generated/prisma/client/client";

export interface ProjectFormData {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  role: string;
  category: string;
  year: string;
  workType: string;
  technologies: string; // comma-separated in the form
  challenge: string;
  approach: string;
  outcome: string;
  highlights: string; // one per line in the form
  client: string;
  liveUrl: string;
  imageAlt: string;
  themeBg: string;
  logoInitials: string;
  logoBg: string;
  richContentJson: string; // raw JSON textarea
  featured: boolean;
  published: boolean;
}

export interface ProjectActionResult {
  ok: boolean;
  error?: string;
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function splitLines(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

function splitCommas(text: string): string[] {
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseRichContent(json: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  const trimmed = json.trim();
  if (!trimmed) return { ok: true, value: {} };
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false, error: "Rich content must be a JSON object, e.g. {}" };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Rich content isn't valid JSON." };
  }
}

function validate(data: ProjectFormData): string | null {
  if (!data.name.trim()) return "Name is required.";
  if (!data.tagline.trim()) return "Tagline is required.";
  if (!data.shortDescription.trim()) return "Short description is required.";
  if (!data.role.trim()) return "Role is required.";
  if (!data.category.trim()) return "Category is required.";
  if (!data.year.trim()) return "Year is required.";
  if (!data.challenge.trim()) return "Challenge is required.";
  if (!data.approach.trim()) return "Approach is required.";
  if (!data.outcome.trim()) return "Outcome is required.";
  if (!data.imageAlt.trim()) return "Image alt text is required.";
  return null;
}

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

function buildData(data: ProjectFormData, slug: string, richContent: Record<string, unknown>) {
  return {
    slug,
    name: data.name.trim(),
    tagline: data.tagline.trim(),
    shortDescription: data.shortDescription.trim(),
    role: data.role.trim(),
    category: data.category.trim(),
    year: data.year.trim(),
    workType: data.workType.trim() || null,
    technologies: splitCommas(data.technologies),
    challenge: data.challenge.trim(),
    approach: data.approach.trim(),
    outcome: data.outcome.trim(),
    highlights: splitLines(data.highlights),
    client: data.client.trim() || null,
    liveUrl: data.liveUrl.trim() || null,
    imageAlt: data.imageAlt.trim(),
    theme: (data.themeBg.trim() ? { bg: data.themeBg.trim() } : undefined) as Prisma.InputJsonValue | undefined,
    logo: (data.logoInitials.trim() ? { initials: data.logoInitials.trim(), bg: data.logoBg.trim() || "#e5e5e5" } : undefined) as Prisma.InputJsonValue | undefined,
    richContent: richContent as Prisma.InputJsonValue,
    featured: data.featured,
    published: data.published,
  };
}

export async function createProject(data: ProjectFormData): Promise<ProjectActionResult> {
  await requireSession();

  const error = validate(data);
  if (error) return { ok: false, error };

  const richResult = parseRichContent(data.richContentJson);
  if (!richResult.ok) return { ok: false, error: richResult.error };

  const slug = slugify(data.slug || data.name);
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: `A project with slug "${slug}" already exists.` };

  const maxOrder = await prisma.project.aggregate({ _max: { sortOrder: true } });

  await prisma.project.create({
    data: {
      ...buildData(data, slug, richResult.value),
      images: [],
      imageLabels: [],
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePublicPages();
  redirect("/case-studies");
}

export async function updateProject(id: string, data: ProjectFormData): Promise<ProjectActionResult> {
  await requireSession();

  const error = validate(data);
  if (error) return { ok: false, error };

  const richResult = parseRichContent(data.richContentJson);
  if (!richResult.ok) return { ok: false, error: richResult.error };

  const slug = slugify(data.slug || data.name);
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { ok: false, error: `A project with slug "${slug}" already exists.` };
  }

  await prisma.project.update({
    where: { id },
    data: buildData(data, slug, richResult.value),
  });

  revalidatePublicPages();
  redirect("/case-studies");
}

export async function deleteProject(id: string): Promise<void> {
  await requireSession();
  await prisma.project.delete({ where: { id } }).catch(() => {});
  revalidatePublicPages();
  revalidatePath("/case-studies");
}

export async function toggleProjectPublished(id: string, published: boolean): Promise<void> {
  await requireSession();
  await prisma.project.update({ where: { id }, data: { published } });
  revalidatePublicPages();
  revalidatePath("/case-studies");
}

export interface FeaturedProjectUpdate {
  id: string;
  featured: boolean;
  sortOrder: number;
  videoMp4: string;
  poster: string;
  shortDescription: string;
}

/** Used by the Homepage → Selected Work dashboard page to pick which case
 *  studies show on the homepage and set their homepage video/description. */
export async function updateFeaturedProjects(items: FeaturedProjectUpdate[]): Promise<{ ok: boolean }> {
  await requireSession();

  await Promise.all(
    items.map((item) =>
      prisma.project.update({
        where: { id: item.id },
        data: {
          featured: item.featured,
          sortOrder: item.sortOrder,
          videoMp4: item.videoMp4.trim() || null,
          poster: item.poster.trim() || null,
          shortDescription: item.shortDescription.trim(),
        },
      })
    )
  );

  revalidatePublicPages();
  revalidatePath("/case-studies");
  revalidatePath("/homepage/selected-work");
  return { ok: true };
}

export interface ImageUploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProjectImage(formData: FormData): Promise<ImageUploadResult> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "File is too large (max 10MB)." };

  const blob = await put(`case-studies/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { ok: true, url: blob.url };
}

export async function addProjectImage(id: string, url: string): Promise<void> {
  await requireSession();
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;
  await prisma.project.update({
    where: { id },
    data: { images: [...project.images, url] },
  });
  revalidatePublicPages();
  revalidatePath(`/case-studies/${id}`);
}

export async function removeProjectImage(id: string, url: string): Promise<void> {
  await requireSession();
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;
  await prisma.project.update({
    where: { id },
    data: { images: project.images.filter((img) => img !== url) },
  });
  revalidatePublicPages();
  revalidatePath(`/case-studies/${id}`);
}
