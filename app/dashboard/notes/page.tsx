import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PinToggle } from "./PinToggle";

export default async function NotesPage() {
  const notes = await prisma.note.findMany({ orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }] });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Notes</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{notes.length} note{notes.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href="/dashboard/notes/new"
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-[14px] text-zinc-500 py-12 text-center border border-dashed border-zinc-800 rounded-xl">
          No notes yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <Link
                  href={`/dashboard/notes/${note.id}`}
                  className="text-[14.5px] font-semibold text-zinc-100 hover:text-emerald-400 transition-colors"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
