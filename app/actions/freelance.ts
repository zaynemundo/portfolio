"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { FreelanceStatus, RateType } from "@/generated/prisma/client/client";

export interface FreelanceProjectFormData {
  name: string;
  /** One line on what happens next — shown on the Jobs list. */
  nextAction: string;
  clientId: string;
  status: string;
  description: string;
  rateAmount: string; // numeric string from the input, "" if unset
  rateCurrency: string;
  rateType: string; // "" | "HOURLY" | "FIXED" | "RETAINER"
  attachmentUrl: string;
  startDate: string; // yyyy-mm-dd or ""
  endDate: string; // yyyy-mm-dd or ""
}

export interface FreelanceActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildData(data: FreelanceProjectFormData) {
  return {
    name: data.name.trim(),
    nextAction: data.nextAction.trim() || null,
    clientId: data.clientId || null,
    status: data.status as FreelanceStatus,
    description: data.description.trim() || null,
    rateAmount: data.rateAmount.trim() ? Number(data.rateAmount) : null,
    rateCurrency: data.rateCurrency.trim() || "AED",
    rateType: (data.rateType || null) as RateType | null,
    attachmentUrl: data.attachmentUrl.trim() || null,
    startDate: parseDate(data.startDate),
    endDate: parseDate(data.endDate),
  };
}

export async function createFreelanceProject(data: FreelanceProjectFormData): Promise<FreelanceActionResult> {
  await requireSession();

  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const project = await prisma.freelanceProject.create({ data: buildData(data) });

  revalidatePath("/freelance");
  updateTag(CACHE_TAGS.freelance);
  return { ok: true, id: project.id };
}

export async function updateFreelanceProject(id: string, data: FreelanceProjectFormData): Promise<FreelanceActionResult> {
  await requireSession();

  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  await prisma.freelanceProject.update({ where: { id }, data: buildData(data) });

  revalidatePath("/freelance");
  revalidatePath(`/freelance/${id}`);
  updateTag(CACHE_TAGS.freelance);
  return { ok: true };
}

export async function deleteFreelanceProject(id: string): Promise<void> {
  await requireSession();
  await prisma.freelanceProject.delete({ where: { id } }).catch(() => {});
  revalidatePath("/freelance");
  updateTag(CACHE_TAGS.freelance);
}

export async function archiveFreelanceProject(id: string, archived: boolean): Promise<void> {
  await requireSession();
  await prisma.freelanceProject.update({ where: { id }, data: { archived } });
  revalidatePath("/freelance");
  revalidatePath(`/freelance/${id}`);
  updateTag(CACHE_TAGS.freelance);
}

/* ── Tasks ─────────────────────────────────────────────────────────── */

export async function addTask(projectId: string, title: string, dueDate = ""): Promise<void> {
  await requireSession();
  if (!title.trim()) return;

  const max = await prisma.freelanceTask.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });

  await prisma.freelanceTask.create({
    data: { projectId, title: title.trim(), dueDate: parseDate(dueDate), sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`/freelance/${projectId}`);
  updateTag(CACHE_TAGS.freelance);
}

export async function toggleTask(taskId: string, projectId: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.update({ where: { id: taskId }, data: { done } });
  revalidatePath(`/freelance/${projectId}`);
  updateTag(CACHE_TAGS.freelance);
}

/** Sets or clears (empty string) a task's due date. */
export async function setTaskDueDate(taskId: string, projectId: string, dueDate: string): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.update({ where: { id: taskId }, data: { dueDate: parseDate(dueDate) } });
  revalidatePath(`/freelance/${projectId}`);
  updateTag(CACHE_TAGS.freelance);
}

export async function deleteTask(taskId: string, projectId: string): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.delete({ where: { id: taskId } }).catch(() => {});
  revalidatePath(`/freelance/${projectId}`);
  updateTag(CACHE_TAGS.freelance);
}

