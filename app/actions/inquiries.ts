"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export async function markInquiryRead(id: string, read: boolean): Promise<void> {
  await requireSession();
  await prisma.inquiry.update({ where: { id }, data: { read } });
  revalidatePath("/inquiries");
  updateTag(CACHE_TAGS.inquiries);
}

export async function deleteInquiry(id: string): Promise<void> {
  await requireSession();
  await prisma.inquiry.delete({ where: { id } }).catch(() => {});
  revalidatePath("/inquiries");
  updateTag(CACHE_TAGS.inquiries);
}
