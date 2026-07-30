import type { Metadata } from "next";
import { prisma } from "../../lib/prisma";
import { AddSkillForm } from "./AddSkillForm";
import { DeleteSkillButton } from "./DeleteSkillButton";

export const metadata: Metadata = { title: "Skills" };

const CATEGORY_COLORS: Record<string, string> = {
  "Design":      "bg-violet-50 text-violet-600",
  "Development": "bg-blue-50 text-blue-600",
  "Platforms":   "bg-emerald-50 text-emerald-600",
  "Tools":       "bg-amber-50 text-amber-600",
  "Marketing":   "bg-pink-50 text-pink-600",
  "Other":       "bg-zinc-100 text-zinc-500",
};

export default async function SkillsPage() {
  let skills: Awaited<ReturnType<typeof prisma.skill.findMany>> = [];
  try {
    skills = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  } catch { /* DB not ready */ }

  // Group by category
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Skills & Tools</h1>
        <p className="text-[14px] text-zinc-500">{skills.length} items — visible on your public profile</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Grouped skill list */}
        <div className="space-y-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
              <p className="text-[14px] font-medium text-zinc-500 mb-1">No skills yet</p>
              <p className="text-[12px] text-zinc-400">Add your first skill using the form →</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {category}
                  </span>
                  <span className="text-[11px] text-zinc-400">{items.length} items</span>
                </div>
                <div className="divide-y divide-zinc-100">
                  {items.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 transition-colors">
                      <span className="text-[13.5px] text-zinc-700">{skill.name}</span>
                      <DeleteSkillButton id={skill.id} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add form — sticky */}
        <div className="lg:sticky lg:top-6">
          <AddSkillForm />
        </div>
      </div>
    </div>
  );
}
