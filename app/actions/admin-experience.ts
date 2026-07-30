"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function get(data: FormData, key: string) {
  return ((data.get(key) as string) ?? "").trim();
}

function experienceFromForm(data: FormData) {
  return {
    type:        get(data, "type"),
    company:     get(data, "company"),
    role:        get(data, "role"),
    period:      get(data, "period"),
    location:    get(data, "location") || null,
    description: get(data, "description") || null,
    current:     data.get("current") === "true",
  };
}

export async function createExperience(data: FormData) {
  const last = await prisma.experience.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? -1) + 1;
  await prisma.experience.create({ data: { ...experienceFromForm(data), sortOrder } });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  redirect("/admin/experience");
}

export async function updateExperience(id: string, data: FormData) {
  await prisma.experience.update({ where: { id }, data: experienceFromForm(data) });
  revalidatePath("/admin/experience");
  revalidatePath("/");
  redirect("/admin/experience");
}

export async function deleteExperience(id: string) {
  await prisma.experience.delete({ where: { id } });
  revalidatePath("/admin/experience");
  revalidatePath("/");
}
