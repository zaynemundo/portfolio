"use client";
import { deleteSkill } from "../../actions/admin-skills";

export function DeleteSkillButton({ id }: { id: string }) {
  return (
    <form action={deleteSkill.bind(null, id)}>
      <button
        type="submit"
        className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"
        title="Delete skill"
        onClick={(e) => { if (!confirm("Delete this skill?")) e.preventDefault(); }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M3.5 3.5l.5 8a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </button>
    </form>
  );
}
