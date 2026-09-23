"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { requireSession } from "@/app/lib/session";

export interface NoteFormData {
  title: string;
  tags: string; // comma-separated
  pinned: boolean;
  contentHtml: string;
}

export interface NoteActionResult {
  ok: boolean;
  error?: string;
}

function splitTags(text: string): string[] {
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function validate(data: NoteFormData): string | null {
  if (!data.title.trim()) return "Title is required.";
  if (!data.contentHtml.trim() || data.contentHtml === "<p></p>") return "Content can't be empty.";
  return null;
}

export async function createNote(data: NoteFormData): Promise<NoteActionResult> {
  await requireSession();

  const error = validate(data);
  if (error) return { ok: false, error };

  const note = await prisma.note.create({
    data: {
      title: data.title.trim(),
      tags: splitTags(data.tags),
      pinned: data.pinned,
      contentHtml: data.contentHtml,
    },
  });

  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNote(id: string, data: NoteFormData): Promise<NoteActionResult> {
  await requireSession();

  const error = validate(data);
  if (error) return { ok: false, error };

  await prisma.note.update({
    where: { id },
    data: {
      title: data.title.trim(),
      tags: splitTags(data.tags),
      pinned: data.pinned,
      contentHtml: data.contentHtml,
    },
  });

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  return { ok: true };
}

export async function deleteNote(id: string): Promise<void> {
  await requireSession();
  await prisma.note.delete({ where: { id } }).catch(() => {});
  revalidatePath("/notes");
  redirect("/notes");
}

export async function toggleNotePinned(id: string, pinned: boolean): Promise<void> {
  await requireSession();
  await prisma.note.update({ where: { id }, data: { pinned } });
  revalidatePath("/notes");
}
