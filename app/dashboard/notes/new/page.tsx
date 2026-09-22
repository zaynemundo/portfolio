import { NoteForm } from "../NoteForm";

export default function NewNotePage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New note</h1>
      <NoteForm mode="new" />
    </div>
  );
}
