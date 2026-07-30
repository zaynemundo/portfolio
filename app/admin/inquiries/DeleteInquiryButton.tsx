"use client";

import { deleteInquiry } from "../../actions/admin-inquiries";

export function DeleteInquiryButton({ id }: { id: string }) {
  return (
    <form action={deleteInquiry.bind(null, id)} className="ml-auto">
      <button
        type="submit"
        className="px-3.5 py-2 rounded-lg border border-zinc-200 text-red-500 text-[12px] font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
        onClick={(e) => { if (!confirm("Delete this inquiry?")) e.preventDefault(); }}
      >
        Delete
      </button>
    </form>
  );
}
