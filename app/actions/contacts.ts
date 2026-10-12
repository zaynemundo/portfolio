"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export interface ContactFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
}

function invalidate() {
  revalidatePath("/clients/[id]", "page");
  revalidatePath("/contacts");
  updateTag(CACHE_TAGS.contacts);
  updateTag(CACHE_TAGS.clients);
}

export async function addContact(clientId: string, data: ContactFormData): Promise<void> {
  await requireSession();
  if (!data.name.trim()) return;

  const max = await prisma.contact.aggregate({
    where: { clientId },
    _max: { sortOrder: true },
  });

  await prisma.contact.create({
    data: {
      clientId,
      name: data.name.trim(),
      role: data.role.trim() || null,
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  invalidate();
}

export async function updateContact(id: string, clientId: string, data: ContactFormData): Promise<void> {
  await requireSession();
  if (!data.name.trim()) return;

  await prisma.contact.update({
    where: { id },
    data: {
      name: data.name.trim(),
      role: data.role.trim() || null,
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
    },
  });
  invalidate();
}

export async function deleteContact(id: string): Promise<void> {
  await requireSession();
  await prisma.contact.delete({ where: { id } }).catch(() => {});
  invalidate();
}
