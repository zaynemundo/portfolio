"use client";

import { useState } from "react";
import { createSkill } from "../../actions/admin-skills";

const CATEGORIES = ["Design", "Development", "Platforms", "Tools", "Marketing", "Other"];

export function AddSkillForm() {
  const [category, setCategory] = useState("Design");

  return (
    <form action={createSkill} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">Add skill</p>

      <div className="grid grid-cols-[1fr_160px] gap-3">
        <div>
          <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">Skill / Tool name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Visual Design"
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">Category</label>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <p className="text-[11px] text-zinc-400 mb-2">Quick categories:</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                category === c
                  ? "border-violet-300 text-violet-700 bg-violet-50"
                  : "border-zinc-200 text-zinc-500 hover:border-violet-200 hover:text-violet-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors"
      >
        Add skill
      </button>
    </form>
  );
}
