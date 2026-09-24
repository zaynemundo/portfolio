import { NoteForm } from "../NoteForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

export default function NewNotePage() {
  return (
    <div>
      <BackLink href={routes.notes.list} label="Notes" />
      <div className="mt-4">
        <NoteForm />
      </div>
    </div>
  );
}
