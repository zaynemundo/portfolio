import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { NotesClient } from "./NotesClient";

const getNotes = unstable_cache(
  () => prisma.note.findMany({ orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }] }),
  ["notes-list"],
  { tags: [CACHE_TAGS.notes], revalidate: 60 }
);

export default async function NotesPage() {
  const notes = await getNotes();

  return <NotesClient notes={notes.map((n) => ({ ...n, updatedAt: new Date(n.updatedAt) }))} />;
}
