"use server";

import { randomBytes } from "node:crypto";
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

/** A document is filed under a client, and can also be put on one of that client's jobs. */
interface Owner {
  clientId?: string | null;
  projectId?: string | null;
}

function invalidate(...owners: Owner[]) {
  for (const { clientId, projectId } of owners) {
    if (clientId) revalidatePath("/clients/[id]", "page");
    if (projectId) revalidatePath(`/freelance/${projectId}`);
  }
  revalidatePath("/documents");
  updateTag(CACHE_TAGS.documents);
  updateTag(CACHE_TAGS.clients);
  updateTag(CACHE_TAGS.freelance);
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get("file") as File | null;
  if (!file) return { ok: false, error: "No file provided." };
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: "File is too large (max 15MB)." };

  try {
    const blob = await put(`document/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false, error: "Upload failed. File storage may not be set up on this machine." };
  }
}

export async function addDocument(name: string, fileUrl: string, owner: Owner): Promise<DocumentActionResult> {
  await requireSession();
  if (!name.trim()) return { ok: false, error: "Name is required." };
  if (!fileUrl.trim()) return { ok: false, error: "File is required." };

  // A document added from a job is filed under that job's client too, so it shows in the client's list.
  let clientId = owner.clientId ?? null;
  if (!clientId && owner.projectId) {
    const project = await prisma.freelanceProject.findUnique({ where: { id: owner.projectId }, select: { clientId: true } });
    clientId = project?.clientId ?? null;
  }

  const doc = await prisma.document.create({
    data: { name: name.trim(), fileUrl, clientId, projectId: owner.projectId ?? null },
  });

  invalidate({ clientId, projectId: owner.projectId });
  return { ok: true, id: doc.id };
}

/** Puts a client's document on one of their jobs, or takes it off (projectId null). The file stays with the client. */
export async function setDocumentJob(id: string, projectId: string | null): Promise<DocumentActionResult> {
  await requireSession();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return { ok: false, error: "Document not found." };

  let clientId = doc.clientId;
  if (projectId) {
    const project = await prisma.freelanceProject.findUnique({ where: { id: projectId }, select: { clientId: true } });
    if (!project) return { ok: false, error: "Job not found." };
    if (doc.clientId && project.clientId && doc.clientId !== project.clientId) {
      return { ok: false, error: "That job belongs to a different client." };
    }
    clientId = doc.clientId ?? project.clientId;
  }

  await prisma.document.update({ where: { id }, data: { projectId, clientId } });

  invalidate({ clientId, projectId }, { projectId: doc.projectId });
  return { ok: true, id };
}

export async function deleteDocument(id: string): Promise<void> {
  await requireSession();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;

  await prisma.document.delete({ where: { id } }).catch(() => {});
  await del(doc.fileUrl).catch(() => {});

  invalidate({ clientId: doc.clientId, projectId: doc.projectId });
}

export interface DocumentShareResult {
  ok: boolean;
  error?: string;
  token?: string;
  /** ISO date the link stops working, or null for no expiry. */
  expiresAt?: string | null;
}

/**
 * Makes a document shareable, or changes how long its link lasts. The link
 * itself is kept if one already exists, so a link already sent keeps working.
 * `expiresInDays` null means the link never expires.
 */
export async function shareDocument(id: string, expiresInDays: number | null): Promise<DocumentShareResult> {
  await requireSession();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return { ok: false, error: "Document not found." };

  const token = doc.shareToken ?? randomBytes(24).toString("base64url");
  const shareExpiresAt =
    expiresInDays && expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;
  await prisma.document.update({ where: { id }, data: { shareToken: token, shareExpiresAt } });

  invalidate({ clientId: doc.clientId, projectId: doc.projectId });
  return { ok: true, token, expiresAt: shareExpiresAt?.toISOString() ?? null };
}

/** Makes a document private again. Any link already sent stops working immediately. */
export async function unshareDocument(id: string): Promise<void> {
  await requireSession();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;

  await prisma.document.update({ where: { id }, data: { shareToken: null, shareExpiresAt: null } });
  invalidate({ clientId: doc.clientId, projectId: doc.projectId });
}
