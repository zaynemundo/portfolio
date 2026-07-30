"use client";

import { deletePost } from "../../actions/admin-blog";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deletePost.bind(null, id)}>
      <button
        type="submit"
        className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
        onClick={(e) => { if (!confirm(`Delete "${title}"?`)) e.preventDefault(); }}
      >
        Delete
      </button>
    </form>
  );
}
