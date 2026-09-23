import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { PinToggle } from "./PinToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";

export default async function NotesPage() {
  const notes = await prisma.note.findMany({ orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }] });

  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle={`${notes.length} note${notes.length === 1 ? "" : "s"}`}
        actionHref={routes.notes.new}
        actionLabel="+ New note"
      />

      {notes.length === 0 ? (
        <EmptyState message="No notes yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <Link
                  href={routes.notes.item(note.id)}
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
