import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { NoteForm } from "../NoteForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
}

const getNote = unstable_cache(
  (id: string) => prisma.note.findUnique({ where: { id } }),
  ["note-detail"],
  { tags: [CACHE_TAGS.notes], revalidate: 60 }
);

export default async function EditNotePage({ params }: Props) {
  const { id } = await params;
  const note = await getNote(id);
  if (!note) notFound();

  return (
    <div>
      <BackLink href={routes.notes.list} label="Notes" />
      <div className="mt-4">
        <NoteForm
          noteId={note.id}
          initial={{
            title: note.title,
            tags: note.tags.join(", "),
            pinned: note.pinned,
            contentHtml: note.contentHtml,
          }}
        />
      </div>
    </div>
  );
}
