"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { Prisma } from "@/generated/prisma/client/client";
import type { SiteSettingsData } from "@/app/lib/settings-db";

export interface SettingsActionResult {
  ok: boolean;
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function updateSiteSettings(
  data: Pick<SiteSettingsData, "email" | "phone" | "linkedinUrl" | "githubUrl">
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
    },
    create: {
      id: "singleton",
      email: data.email.trim(),
      phone: data.phone.trim(),
      linkedinUrl: data.linkedinUrl.trim(),
      githubUrl: data.githubUrl.trim(),
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function updateHomepageContent(data: {
  name: string;
  jobTitle: string;
  heroScenesJson: string;
  aboutChaptersJson: string;
}): Promise<SettingsActionResult> {
  await requireSession();

  let heroScenes: unknown;
  let aboutChapters: unknown;
  try {
    heroScenes = JSON.parse(data.heroScenesJson);
  } catch {
    return { ok: false, error: "Hero scenes JSON is not valid." };
  }
  try {
    aboutChapters = JSON.parse(data.aboutChaptersJson);
  } catch {
    return { ok: false, error: "About chapters JSON is not valid." };
  }
  if (!Array.isArray(heroScenes) || !Array.isArray(aboutChapters)) {
    return { ok: false, error: "Both fields must be JSON arrays." };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      name: data.name.trim(),
      jobTitle: data.jobTitle.trim(),
      heroScenes: heroScenes as Prisma.InputJsonValue,
      aboutChapters: aboutChapters as Prisma.InputJsonValue,
    },
    create: {
      id: "singleton",
      name: data.name.trim(),
      jobTitle: data.jobTitle.trim(),
      heroScenes: heroScenes as Prisma.InputJsonValue,
      aboutChapters: aboutChapters as Prisma.InputJsonValue,
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

async function uploadAsset(file: File, prefix: string, allowedTypes: string[]): Promise<UploadResult> {
  await requireSession();

  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is too large (max 10MB)." };
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
