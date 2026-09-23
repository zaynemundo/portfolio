import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { PinToggle } from "./PinToggle";
import { DeleteNoteButton } from "./DeleteNoteButton";
import { routes } from "@/app/(admin)/_routes";

const getNotes = unstable_cache(
  () => prisma.note.findMany({ orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }] }),
  ["notes-list"],
  { tags: [CACHE_TAGS.notes], revalidate: 60 }
);

export default async function NotesPage() {
  const rows = await getNotes();
  const notes = rows.map((n) => ({ ...n, updatedAt: new Date(n.updatedAt) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Notes</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{notes.length} note{notes.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href={routes.notes.new}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New note
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState message="No notes yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <Link
                  href={routes.notes.item(note.id)}
                  className="text-[14.5px] font-semibold text-zinc-100 hover:text-emerald-400 transition-colors text-left"
                >
                  {note.title}
                </Link>
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

              <div className="absolute bottom-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={routes.notes.item(note.id)}
                  className="text-[12px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Edit
                </Link>
                <DeleteNoteButton id={note.id} title={note.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
