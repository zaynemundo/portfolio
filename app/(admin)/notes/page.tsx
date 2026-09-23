import { prisma } from "@/app/lib/prisma";
import { NotesClient } from "./NotesClient";

export default async function NotesPage() {
  const notes = await prisma.note.findMany({ orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }] });

  return <NotesClient notes={notes} />;
}
