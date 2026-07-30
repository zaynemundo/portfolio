"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function markRead(id: string) {
  await prisma.contactSubmission.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/inquiries");
}

export async function markUnread(id: string) {
  await prisma.contactSubmission.update({ where: { id }, data: { read: false } });
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  await prisma.contactSubmission.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
}
