"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNote, updateNote, type NoteFormData } from "@/app/actions/notes";
import { RichEditor } from "@/app/(admin)/_components/RichEditor";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  mode: "new" | "edit";
  noteId?: string;
  initial?: Partial<NoteFormData>;
  /** Called after a successful save. If omitted, falls back to the standalone-page
   *  default: redirect to the note on create, router.refresh() on edit. Pass this
   *  when rendering the form inside a Modal to close it instead. */
  onSuccess?: () => void;
}

export function NoteForm({ mode, noteId, initial, onSuccess }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "<p></p>");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: NoteFormData = { title, tags, pinned, contentHtml };

    startTransition(async () => {
      const result = mode === "new" ? await createNote(data) : await updateNote(noteId!, data);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (onSuccess) {
        onSuccess();
        return;
      }
      if (mode === "new" && result.id) router.push(routes.notes.item(result.id));
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label htmlFor="title" className="block text-xs font-medium text-zinc-400 mb-1.5">Title</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-xs font-medium text-zinc-400 mb-1.5">Tags (comma-separated)</label>
        <input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="ideas, client-x, reference"
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Content</label>
        <RichEditor content={contentHtml} onChange={setContentHtml} />
      </div>

      <label className="flex items-center gap-2 text-[13.5px] text-zinc-300 cursor-pointer">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded border-zinc-700 bg-zinc-900" />
        Pinned
      </label>

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-5 py-2.5 hover:bg-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : mode === "new" ? "Create note" : "Save changes"}
      </button>
    </form>
  );
}
