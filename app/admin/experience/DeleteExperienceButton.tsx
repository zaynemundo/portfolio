"use client";
import { deleteExperience } from "../../actions/admin-experience";

export function DeleteExperienceButton({ id }: { id: string }) {
  return (
    <form action={deleteExperience.bind(null, id)}>
      <button
        type="submit"
        className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
        onClick={(e) => { if (!confirm("Delete this entry?")) e.preventDefault(); }}
      >
        Delete
      </button>
    </form>
  );
}
