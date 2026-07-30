"use client";

import { deleteProject } from "../../actions/admin-projects";

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteProject.bind(null, id)}>
      <button
        type="submit"
        className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
        onClick={(e) => { if (!confirm(`Delete "${name}"?`)) e.preventDefault(); }}
      >
        Delete
      </button>
    </form>
  );
}
