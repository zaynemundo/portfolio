"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { decryptSecret, encryptSecret } from "@/app/lib/vault";

export interface AccessFormData {
  label: string;
  url: string;
  username: string;
  /** A new password. Empty when editing = keep the saved one. */
  password: string;
  /** Editing only: remove the saved password. */
  clearPassword?: boolean;
  notes: string;
  /** The job it's for; empty = all of the client's jobs. */
  projectId: string;
}

export interface AccessResult {
  ok: boolean;
  error?: string;
}

function invalidate() {
  revalidatePath("/clients/[id]", "page");
  revalidatePath("/freelance/[id]", "page");
  updateTag(CACHE_TAGS.clients);
  updateTag(CACHE_TAGS.freelance);
}

/** The plain fields, tidied. The password is handled separately. */
function fields(data: AccessFormData) {
  return {
    label: data.label.trim(),
    url: data.url.trim() || null,
    username: data.username.trim() || null,
    notes: data.notes.trim() || null,
    projectId: data.projectId || null,
  };
}

/** Turns a thrown encryption error (most likely ACCESS_KEY missing) into a message for the form. */
function failure(e: unknown): AccessResult {
  return { ok: false, error: e instanceof Error ? e.message : "Couldn't save the password." };
}

export async function addAccess(clientId: string | null, data: AccessFormData): Promise<AccessResult> {
  await requireSession();
  if (!data.label.trim()) return { ok: false, error: "Give it a name, e.g. WordPress admin." };
  try {
    const max = await prisma.accessDetail.aggregate({ where: { clientId, projectId: data.projectId || null }, _max: { sortOrder: true } });
    await prisma.accessDetail.create({
      data: {
        ...fields(data),
        clientId,
        passwordEncrypted: data.password ? encryptSecret(data.password) : null,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (e) {
    return failure(e);
  }
  invalidate();
  return { ok: true };
}

export async function updateAccess(id: string, data: AccessFormData): Promise<AccessResult> {
  await requireSession();
  if (!data.label.trim()) return { ok: false, error: "Give it a name, e.g. WordPress admin." };
  try {
    await prisma.accessDetail.update({
      where: { id },
      data: {
        ...fields(data),
        // An empty password field keeps the saved one; only a typed one replaces it.
        ...(data.password
          ? { passwordEncrypted: encryptSecret(data.password) }
          : data.clearPassword
            ? { passwordEncrypted: null }
            : {}),
      },
    });
  } catch (e) {
    return failure(e);
  }
  invalidate();
  return { ok: true };
}

export async function deleteAccess(id: string): Promise<void> {
  await requireSession();
  await prisma.accessDetail.delete({ where: { id } }).catch(() => {});
  invalidate();
}

/** The saved password, decrypted, for Show or Copy. Only ever sent when asked for, never with the page. */
export async function revealAccessPassword(id: string): Promise<{ ok: boolean; password?: string; error?: string }> {
  await requireSession();
  const row = await prisma.accessDetail.findUnique({ where: { id }, select: { passwordEncrypted: true } });
  if (!row?.passwordEncrypted) return { ok: false, error: "No password saved." };
  try {
    return { ok: true, password: decryptSecret(row.passwordEncrypted) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn't read the password." };
  }
}
