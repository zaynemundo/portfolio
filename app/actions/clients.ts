"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import type { ClientType } from "@/app/lib/enums";
import { uniqueClientSlug } from "@/app/lib/client-slug";

export interface ClientFormData {
  name: string;
  type: string; // "" | "COMPANY" | "INDIVIDUAL"
  company: string;
}

export interface ClientActionResult {
  ok: boolean;
  error?: string;
  id?: string;
  /** The client's address under /clients — changes when the client is renamed. */
  slug?: string;
}

export async function createClient(data: ClientFormData): Promise<ClientActionResult> {
  await requireSession();
  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const slug = await uniqueClientSlug(data.name);
  const client = await prisma.client.create({
    data: {
      name: data.name.trim(),
      slug,
      type: (data.type || null) as ClientType | null,
      company: data.company.trim() || null,
    },
  });

  revalidatePath("/clients");
  updateTag(CACHE_TAGS.clients);
  return { ok: true, id: client.id, slug };
}

export async function updateClient(id: string, data: ClientFormData): Promise<ClientActionResult> {
  await requireSession();
  if (!data.name.trim()) return { ok: false, error: "Name is required." };

  const slug = await uniqueClientSlug(data.name, id);
  await prisma.client.update({
    where: { id },
    data: {
      name: data.name.trim(),
      slug,
      type: (data.type || null) as ClientType | null,
      company: data.company.trim() || null,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/clients/[id]", "page");
  updateTag(CACHE_TAGS.clients);
  updateTag(CACHE_TAGS.freelance);
  return { ok: true, id, slug };
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
