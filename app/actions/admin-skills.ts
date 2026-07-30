"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function get(data: FormData, key: string) {
  return ((data.get(key) as string) ?? "").trim();
}

export async function createSkill(data: FormData) {
  const last = await prisma.skill.findFirst({ orderBy: { sortOrder: "desc" } });
  const sortOrder = (last?.sortOrder ?? -1) + 1;
  await prisma.skill.create({
    data: { name: get(data, "name"), category: get(data, "category") || "Design", sortOrder },
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  redirect("/admin/skills");
}

export async function deleteSkill(id: string) {
  await prisma.skill.delete({ where: { id } });
  revalidatePath("/admin/skills");
  revalidatePath("/");
}
