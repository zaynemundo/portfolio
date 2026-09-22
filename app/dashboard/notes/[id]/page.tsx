import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { NoteForm } from "../NoteForm";
import { DeleteNoteButton } from "../DeleteNoteButton";
import { BackLink } from "@/app/dashboard/components/BackLink";
import { routes } from "@/app/dashboard/routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: Props) {
  const { id } = await params;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <BackLink href={routes.notes.list} label="Notes" />
          <h1 className="text-[22px] font-semibold text-zinc-100 mt-1">Edit note</h1>
        </div>
        <DeleteNoteButton id={note.id} title={note.title} />
      </div>

      <NoteForm
        mode="edit"
        noteId={note.id}
        initial={{
          title: note.title,
          tags: note.tags.join(", "),
          pinned: note.pinned,
          contentHtml: note.contentHtml,
        }}
      />
    </div>
  );
}
