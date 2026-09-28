"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import type { UploadResult } from "@/app/actions/settings";

export interface DocumentActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

interface Owner {
  clientId?: string;
  projectId?: string;
}

function invalidate({ clientId, projectId }: Owner) {
  if (clientId) revalidatePath(`/clients/${clientId}`);
  if (projectId) revalidatePath(`/freelance/${projectId}`);
  updateTag(CACHE_TAGS.documents);
  updateTag(CACHE_TAGS.clients);
  updateTag(CACHE_TAGS.freelance);
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: "File is too large (max 15MB)." };

  const blob = await put(`document/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { ok: true, url: blob.url };
}

export async function addDocument(name: string, fileUrl: string, owner: Owner): Promise<DocumentActionResult> {
  await requireSession();
  if (!name.trim()) return { ok: false, error: "Name is required." };
  if (!fileUrl.trim()) return { ok: false, error: "File is required." };

  const doc = await prisma.document.create({
    data: { name: name.trim(), fileUrl, clientId: owner.clientId ?? null, projectId: owner.projectId ?? null },
  });

  invalidate(owner);
  return { ok: true, id: doc.id };
}

export async function deleteDocument(id: string, owner: Owner): Promise<void> {
  await requireSession();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;

  await prisma.document.delete({ where: { id } }).catch(() => {});
  await del(doc.fileUrl).catch(() => {});

  invalidate(owner);
}
