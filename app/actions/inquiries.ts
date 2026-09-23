"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";

export async function markInquiryRead(id: string, read: boolean): Promise<void> {
  await requireSession();
  await prisma.inquiry.update({ where: { id }, data: { read } });
  revalidatePath("/inquiries");
}

export async function deleteInquiry(id: string): Promise<void> {
  await requireSession();
  await prisma.inquiry.delete({ where: { id } }).catch(() => {});
  revalidatePath("/inquiries");
}
