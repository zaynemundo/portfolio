"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { FreelanceStatus, RateType } from "@/generated/prisma/client/client";
import type { UploadResult } from "@/app/actions/settings";

export interface FreelanceProjectFormData {
  name: string;
  clientId: string;
  status: string;
  description: string;
  rateAmount: string; // numeric string from the input, "" if unset
  rateCurrency: string;
  rateType: string; // "" | "HOURLY" | "FIXED" | "RETAINER"
  attachmentUrl: string;
  deadline: string; // yyyy-mm-dd or ""
}

export interface FreelanceActionResult {
  ok: boolean;
  error?: string;
}

function parseDeadline(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildData(data: FreelanceProjectFormData) {
  return {
    name: data.name.trim(),
    clientId: data.clientId || null,
    status: data.status as FreelanceStatus,
    description: data.description.trim() || null,
    rateAmount: data.rateAmount.trim() ? Number(data.rateAmount) : null,
    rateCurrency: data.rateCurrency.trim() || "AED",
    rateType: (data.rateType || null) as RateType | null,
    attachmentUrl: data.attachmentUrl.trim() || null,
    deadline: parseDeadline(data.deadline),
  };
}

export async function createFreelanceProject(data: FreelanceProjectFormData): Promise<FreelanceActionResult> {
  await requireSession();

  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const project = await prisma.freelanceProject.create({ data: buildData(data) });

  revalidatePath("/freelance");
  redirect(`/freelance/${project.id}`);
}

export async function updateFreelanceProject(id: string, data: FreelanceProjectFormData): Promise<FreelanceActionResult> {
  await requireSession();

  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  await prisma.freelanceProject.update({ where: { id }, data: buildData(data) });

  revalidatePath("/freelance");
  revalidatePath(`/freelance/${id}`);
  return { ok: true };
}

export async function deleteFreelanceProject(id: string): Promise<void> {
  await requireSession();
  await prisma.freelanceProject.delete({ where: { id } }).catch(() => {});
  revalidatePath("/freelance");
  redirect("/freelance");
}

export async function archiveFreelanceProject(id: string, archived: boolean): Promise<void> {
  await requireSession();
  await prisma.freelanceProject.update({ where: { id }, data: { archived } });
  revalidatePath("/freelance");
  revalidatePath(`/freelance/${id}`);
}

export async function uploadFreelanceAttachment(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: "File is too large (max 15MB)." };

  const blob = await put(`freelance-attachment/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { ok: true, url: blob.url };
}

/* ── Tasks ─────────────────────────────────────────────────────────── */

export async function addTask(projectId: string, title: string): Promise<void> {
  await requireSession();
  if (!title.trim()) return;

  const max = await prisma.freelanceTask.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  await prisma.freelanceTask.create({
    data: { projectId, title: title.trim(), sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`/freelance/${projectId}`);
}

export async function toggleTask(taskId: string, projectId: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.update({ where: { id: taskId }, data: { done } });
  revalidatePath(`/freelance/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.delete({ where: { id: taskId } }).catch(() => {});
  revalidatePath(`/freelance/${projectId}`);
}
