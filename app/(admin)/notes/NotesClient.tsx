"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/(admin)/_components/Modal";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { NoteForm } from "./NoteForm";
import { PinToggle } from "./PinToggle";
import { DeleteNoteButton } from "./DeleteNoteButton";
import type { NoteFormData } from "@/app/actions/notes";

export interface NoteRow {
  id: string;
  title: string;
  tags: string[];
  pinned: boolean;
  contentHtml: string;
  updatedAt: Date;
}

export function NotesClient({ notes }: { notes: NoteRow[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"new" | NoteRow | null>(null);

  function close() {
    setModal(null);
    router.refresh();
  }

  const editing = modal && modal !== "new" ? modal : null;
  const initial: Partial<NoteFormData> | undefined = editing
    ? { title: editing.title, tags: editing.tags.join(", "), pinned: editing.pinned, contentHtml: editing.contentHtml }
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Notes</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{notes.length} note{notes.length === 1 ? "" : "s"}</p>
        </div>
        <button
          type="button"
          onClick={() => setModal("new")}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New note
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState message="No notes yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModal(note)}
                  className="text-[14.5px] font-semibold text-zinc-100 hover:text-emerald-400 transition-colors text-left"
                >
                  {note.title}
                </button>
                <PinToggle id={note.id} pinned={note.pinned} />
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-[10.5px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[12px] text-zinc-600">
                Updated {note.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal !== null} onClose={close} title={editing ? editing.title : "New note"} maxWidthClassName="max-w-2xl">
        <NoteForm mode={editing ? "edit" : "new"} noteId={editing?.id} initial={initial} onSuccess={close} />
        {editing && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <DeleteNoteButton id={editing.id} title={editing.title} onDeleted={close} />
          </div>
        )}
      </Modal>
    </div>
  );
}
