"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createNote, updateNote, type NoteFormData } from "@/app/actions/notes";
import { RichEditor } from "@/app/(admin)/_components/RichEditor";
import { DeleteNoteButton } from "./DeleteNoteButton";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  noteId?: string;
  initial?: Partial<NoteFormData>;
  /** Called after the note is deleted, so the parent can close the modal. */
  onDeleted?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Apple-Notes-style: no separate edit mode, no Save button — every change autosaves. */
export function NoteForm({ noteId, initial, onDeleted }: Props) {
  const router = useRouter();
  const [id, setId] = useState(noteId ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "<p></p>");
  const [status, setStatus] = useState<SaveStatus>("idle");

  const isFirstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!title.trim() || (!contentHtml.trim() || contentHtml === "<p></p>")) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setStatus("saving");
      const data: NoteFormData = { title, tags, pinned, contentHtml };
      const result = id ? await updateNote(id, data) : await createNote(data);
      if (!result.ok) {
        setStatus("error");
        return;
      }
      if (!id && result.id) {
        setId(result.id);
        router.replace(routes.notes.item(result.id));
      }
      setStatus("saved");
      router.refresh();
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, tags, pinned, contentHtml]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ outline: "none" }}
          className="w-full text-[21px] font-semibold text-zinc-100 placeholder:text-zinc-600 bg-transparent focus:outline-none"
        />
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <button
            type="button"
            onClick={() => setPinned((p) => !p)}
            aria-label={pinned ? "Unpin" : "Pin"}
            title={pinned ? "Unpin" : "Pin"}
            className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
              pinned ? "text-amber-400 bg-amber-400/10" : "text-zinc-400 bg-zinc-800/60 hover:text-zinc-100 hover:bg-zinc-800"
            }`}
          >
            <StarIcon filled={pinned} />
          </button>
          {id && <DeleteNoteButton id={id} title={title} onDeleted={onDeleted} />}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags, comma-separated"
          style={{ outline: "none" }}
          className="text-[12px] text-zinc-500 placeholder:text-zinc-700 bg-transparent focus:outline-none"
        />
        {status !== "idle" && (
          <span className="text-[11px] text-zinc-600">
            · {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "error" && <span className="text-red-400">Couldn&apos;t save</span>}
          </span>
        )}
      </div>

      <RichEditor content={contentHtml} onChange={setContentHtml} bordered={false} />
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M10 2.5 12.35 7.9l5.87.63-4.4 3.98 1.24 5.79L10 15.35l-5.06 2.95 1.24-5.79-4.4-3.98 5.87-.63L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
