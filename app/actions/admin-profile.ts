"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "./upload";

export async function getSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch {
    return null;
  }
}

/** Portrait + CV only */
export async function saveSettings(data: FormData) {
  const cvPath      = (data.get("cvPath") as string)?.trim() || "/docs/zaira-mundo-cv.pdf";
  const portraitUrl = (data.get("portraitUrl") as string)?.trim() || null;

  let finalCvPath = cvPath;
  const uploadedCv = await uploadFile(data, "cvFile", "cv");
  if (uploadedCv) finalCvPath = uploadedCv;

  let finalPortraitUrl = portraitUrl;
  const uploadedPortrait = await uploadFile(data, "portraitFile", "portraits");
  if (uploadedPortrait) finalPortraitUrl = uploadedPortrait;

  try {
    await prisma.siteSettings.upsert({
      where:  { id: "default" },
      update: { cvPath: finalCvPath, portraitUrl: finalPortraitUrl },
      create: { id: "default", cvPath: finalCvPath, portraitUrl: finalPortraitUrl },
    });
    revalidatePath("/admin/profile");
    revalidatePath("/");
  } catch (err) {
    console.error("[profile] DB error:", err);
  }
}

/** About text only */
export async function saveAbout(data: FormData) {
  const aboutText = (data.get("aboutText") as string)?.trim() || null;
  try {
    await prisma.siteSettings.upsert({
      where:  { id: "default" },
      update: { aboutText },
      create: { id: "default", aboutText },
    });
    revalidatePath("/admin/about");
    revalidatePath("/");
  } catch (err) {
    console.error("[about] DB error:", err);
  }
}

/** Contact links */
export async function saveLinks(data: FormData) {
  const email       = (data.get("email") as string)?.trim() || null;
  const phone       = (data.get("phone") as string)?.trim() || null;
  const linkedinUrl = (data.get("linkedinUrl") as string)?.trim() || null;
  const githubUrl   = (data.get("githubUrl") as string)?.trim() || null;

  try {
    await prisma.siteSettings.upsert({
      where:  { id: "default" },
      update: { email, phone, linkedinUrl, githubUrl },
      create: { id: "default", email, phone, linkedinUrl, githubUrl },
    });
    revalidatePath("/admin/links");
    revalidatePath("/");
  } catch (err) {
    console.error("[links] DB error:", err);
  }
}
