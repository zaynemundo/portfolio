"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { FreelanceStatus } from "@/generated/prisma/client/client";

export interface FreelanceProjectFormData {
  name: string;
  client: string;
  status: string;
  description: string;
  rate: string;
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

export async function createFreelanceProject(data: FreelanceProjectFormData): Promise<FreelanceActionResult> {
  await requireSession();

  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const project = await prisma.freelanceProject.create({
    data: {
      name: data.name.trim(),
      client: data.client.trim() || null,
      status: data.status as FreelanceStatus,
      description: data.description.trim() || null,
      rate: data.rate.trim() || null,
      deadline: parseDeadline(data.deadline),
    },
  });

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateFreelanceProject(id: string, data: FreelanceProjectFormData): Promise<FreelanceActionResult> {
  await requireSession();

  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  await prisma.freelanceProject.update({
    where: { id },
    data: {
      name: data.name.trim(),
      client: data.client.trim() || null,
      status: data.status as FreelanceStatus,
      description: data.description.trim() || null,
      rate: data.rate.trim() || null,
      deadline: parseDeadline(data.deadline),
    },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
  return { ok: true };
}

export async function deleteFreelanceProject(id: string): Promise<void> {
  await requireSession();
  await prisma.freelanceProject.delete({ where: { id } }).catch(() => {});
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function archiveFreelanceProject(id: string, archived: boolean): Promise<void> {
  await requireSession();
  await prisma.freelanceProject.update({ where: { id }, data: { archived } });
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
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
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function toggleTask(taskId: string, projectId: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.update({ where: { id: taskId }, data: { done } });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string): Promise<void> {
  await requireSession();
  await prisma.freelanceTask.delete({ where: { id: taskId } }).catch(() => {});
  revalidatePath(`/dashboard/projects/${projectId}`);
}
