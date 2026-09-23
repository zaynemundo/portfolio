"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { Prisma } from "@/generated/prisma/client/client";
import { getSiteSettings, type HeroSceneData } from "@/app/lib/settings-db";
import type { Chapter } from "@/app/data/aboutChapters";

export interface SettingsActionResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function revalidateHomepage() {
  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/homepage/hero");
  revalidatePath("/dashboard/homepage/selected-work");
  revalidatePath("/dashboard/homepage/about");
  revalidatePath("/dashboard/homepage/insights");
}

function revalidateWorkPage() {
  revalidatePath("/work");
  revalidatePath("/dashboard/work-page");
}

function revalidateBlogPage() {
  revalidatePath("/insights");
  revalidatePath("/dashboard/blog-page");
}

export async function updateSiteSettings(
  data: { email: string; phone: string; linkedinUrl: string; githubUrl: string; name: string; jobTitle: string }
): Promise<SettingsActionResult> {
  await requireSession();

  if (!isValidEmail(data.email.trim())) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      email: data.email.trim(),
      phone: data.phone.trim(),
      linkedinUrl: data.linkedinUrl.trim(),
      githubUrl: data.githubUrl.trim(),
      name: data.name.trim(),
      jobTitle: data.jobTitle.trim(),
    },
    create: {
      id: "singleton",
      email: data.email.trim(),
      phone: data.phone.trim(),
      linkedinUrl: data.linkedinUrl.trim(),
      githubUrl: data.githubUrl.trim(),
      name: data.name.trim(),
      jobTitle: data.jobTitle.trim(),
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB

async function uploadAsset(file: File, prefix: string, allowedTypes: string[], maxBytes = MAX_UPLOAD_BYTES): Promise<UploadResult> {
  await requireSession();

  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `File is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB).` };
  }

  const blob = await put(`${prefix}/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { ok: true, url: blob.url };
}

export async function uploadResume(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };

  const result = await uploadAsset(file, "resume", ["application/pdf"]);
  if (!result.ok || !result.url) return result;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { resumeUrl: result.url },
    create: { id: "singleton", resumeUrl: result.url },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return result;
}

export async function uploadPortrait(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };

  const result = await uploadAsset(file, "portrait", ["image/jpeg", "image/png", "image/webp"]);
  if (!result.ok || !result.url) return result;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { portraitUrl: result.url },
    create: { id: "singleton", portraitUrl: result.url },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return result;
}

/* ── Homepage: hero banner ────────────────────────────────────────────── */

export async function uploadHeroVideo(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };

  const result = await uploadAsset(file, "hero-video", ["video/mp4", "video/webm"], MAX_VIDEO_UPLOAD_BYTES);
  if (!result.ok || !result.url) return result;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroVideoUrl: result.url },
    create: { id: "singleton", heroVideoUrl: result.url },
  });

  revalidateHomepage();
  return result;
}

export async function uploadHeroPoster(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };

  const result = await uploadAsset(file, "hero-poster", ["image/jpeg", "image/png", "image/webp"]);
  if (!result.ok || !result.url) return result;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroPosterUrl: result.url },
    create: { id: "singleton", heroPosterUrl: result.url },
  });

  revalidateHomepage();
  return result;
}

export async function updateHeroScenes(scenes: HeroSceneData[]): Promise<SettingsActionResult> {
  await requireSession();

  if (!Array.isArray(scenes) || scenes.some((s) => typeof s.heading !== "string" || typeof s.start !== "number" || typeof s.end !== "number")) {
    return { ok: false, error: "Each scene needs a heading, start, and end." };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroScenes: scenes as unknown as Prisma.InputJsonValue },
    create: { id: "singleton", heroScenes: scenes as unknown as Prisma.InputJsonValue },
  });

  revalidateHomepage();
  return { ok: true };
}

/* ── Homepage: Selected Work ──────────────────────────────────────────── */

export async function updateSelectedWorkCopy(data: { heading: string; intro: string }): Promise<SettingsActionResult> {
  await requireSession();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { selectedWorkHeading: data.heading.trim(), selectedWorkIntro: data.intro.trim() },
    create: { id: "singleton", selectedWorkHeading: data.heading.trim(), selectedWorkIntro: data.intro.trim() },
  });

  revalidateHomepage();
  return { ok: true };
}

/* ── Homepage: About chapters ─────────────────────────────────────────── */

async function replaceAboutChapter(id: string, updated: Chapter): Promise<SettingsActionResult> {
  await requireSession();

  const { aboutChapters } = await getSiteSettings();
  const next = aboutChapters.map((c) => (c.id === id ? updated : c));

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { aboutChapters: next as unknown as Prisma.InputJsonValue },
    create: { id: "singleton", aboutChapters: next as unknown as Prisma.InputJsonValue },
  });

  revalidateHomepage();
  return { ok: true };
}

export async function updateAboutChapter(chapter: Chapter): Promise<SettingsActionResult> {
  return replaceAboutChapter(chapter.id, chapter);
}

/* ── Homepage: Insights ───────────────────────────────────────────────── */

export async function updateInsightsCopy(data: { heading: string; intro: string }): Promise<SettingsActionResult> {
  await requireSession();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { insightsHeading: data.heading.trim(), insightsIntro: data.intro.trim() },
    create: { id: "singleton", insightsHeading: data.heading.trim(), insightsIntro: data.intro.trim() },
  });

  revalidateHomepage();
  return { ok: true };
}

/* ── /work page ────────────────────────────────────────────────────────── */

export async function updateWorkPageCopy(data: { heading: string; intro: string }): Promise<SettingsActionResult> {
  await requireSession();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { workPageHeading: data.heading.trim(), workPageIntro: data.intro.trim() },
    create: { id: "singleton", workPageHeading: data.heading.trim(), workPageIntro: data.intro.trim() },
  });

  revalidateWorkPage();
  return { ok: true };
}

export async function updateBlogPageCopy(data: { heading: string; intro: string }): Promise<SettingsActionResult> {
  await requireSession();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { blogPageHeading: data.heading.trim(), blogPageIntro: data.intro.trim() },
    create: { id: "singleton", blogPageHeading: data.heading.trim(), blogPageIntro: data.intro.trim() },
  });

  revalidateBlogPage();
  return { ok: true };
}

export interface ClientLogoInput {
  id: string;
  name: string;
  initials: string;
  bg: string;
  light: boolean;
}

export async function updateClientLogos(items: ClientLogoInput[]): Promise<SettingsActionResult> {
  await requireSession();

  const existingIds = items.filter((i) => !i.id.startsWith("new-")).map((i) => i.id);
  await prisma.clientLogo.deleteMany({ where: { id: { notIn: existingIds } } });

  await Promise.all(
    items.map((item, index) => {
      const data = {
        name: item.name.trim(),
        initials: item.initials.trim(),
        bg: item.bg.trim(),
        light: item.light,
        sortOrder: index,
      };
      return item.id.startsWith("new-")
        ? prisma.clientLogo.create({ data })
        : prisma.clientLogo.update({ where: { id: item.id }, data });
    })
  );

  revalidateWorkPage();
  return { ok: true };
}
