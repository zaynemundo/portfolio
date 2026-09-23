"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

export interface ClientActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export async function createClient(data: ClientFormData): Promise<ClientActionResult> {
  await requireSession();
  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const client = await prisma.client.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      company: data.company.trim() || null,
      notes: data.notes.trim() || null,
    },
  });

  revalidatePath("/clients");
  updateTag(CACHE_TAGS.clients);
  return { ok: true, id: client.id };
}

export async function updateClient(id: string, data: ClientFormData): Promise<ClientActionResult> {
  await requireSession();
  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  await prisma.client.update({
    where: { id },
    data: {
      name: data.name.trim(),
      email: data.email.trim() || null,
      phone: data.phone.trim() || null,
      company: data.company.trim() || null,
      notes: data.notes.trim() || null,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  updateTag(CACHE_TAGS.clients);
  return { ok: true };
}

export async function deleteClient(id: string): Promise<void> {
  await requireSession();
  await prisma.client.delete({ where: { id } }).catch(() => {});
  revalidatePath("/clients");
  revalidatePath("/freelance");
  revalidatePath("/finance");
  updateTag(CACHE_TAGS.clients);
  updateTag(CACHE_TAGS.freelance);
  updateTag(CACHE_TAGS.transactions);
  updateTag(CACHE_TAGS.invoices);
}
