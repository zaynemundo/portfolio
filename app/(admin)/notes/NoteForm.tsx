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
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-[20px] font-semibold text-zinc-100 placeholder:text-zinc-600 bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          aria-label={pinned ? "Unpin" : "Pin"}
          className={`shrink-0 text-lg transition-colors ${pinned ? "text-amber-400" : "text-zinc-600 hover:text-zinc-400"}`}
        >
          ★
        </button>
      </div>

      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Add tags, comma-separated"
        className="w-full text-[12px] text-zinc-500 placeholder:text-zinc-700 bg-transparent focus:outline-none mb-4"
      />

      <RichEditor content={contentHtml} onChange={setContentHtml} bordered={false} />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
        <p className="text-[11.5px] text-zinc-600">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "error" && <span className="text-red-400">Couldn&apos;t save — check your connection.</span>}
        </p>
        {id && <DeleteNoteButton id={id} title={title} onDeleted={onDeleted} />}
      </div>
    </div>
  );
}
