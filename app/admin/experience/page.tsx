import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { DeleteExperienceButton } from "./DeleteExperienceButton";

export const metadata: Metadata = { title: "Experience" };

const TYPE_LABEL: Record<string, string> = {
  employment: "Work",
  education: "Education",
  certification: "Certification",
};

export default async function ExperiencePage() {
  let entries: Awaited<ReturnType<typeof prisma.experience.findMany>> = [];
  try {
    entries = await prisma.experience.findMany({ orderBy: { sortOrder: "asc" } });
  } catch { /* DB not ready */ }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Experience</h1>
          <p className="text-[14px] text-zinc-500">{entries.length} entries</p>
        </div>
        <Link
          href="/admin/experience/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center shadow-sm">
          <p className="text-[14px] font-medium text-zinc-500 mb-1">No experience entries yet</p>
          <p className="text-[12px] text-zinc-400 mb-4">Add your employment, education, and certifications.</p>
          <Link href="/admin/experience/new" className="text-[13px] font-semibold text-violet-600 hover:text-violet-700">
            Add first entry →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5">Type</th>
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5">Company / Institution</th>
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5 hidden md:table-cell">Role / Qualification</th>
                <th className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] px-6 py-3.5 hidden md:table-cell">Period</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      e.type === "employment" ? "bg-violet-50 text-violet-600"
                      : e.type === "education" ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                    }`}>
                      {TYPE_LABEL[e.type] ?? e.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13.5px] font-semibold text-zinc-900">{e.company}</p>
                    {e.current && <span className="text-[10px] font-medium text-emerald-600">Current</span>}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-zinc-500 hidden md:table-cell">{e.role}</td>
                  <td className="px-6 py-4 text-[12px] font-mono text-zinc-400 hidden md:table-cell">{e.period}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/admin/experience/${e.id}`} className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">
                        Edit
                      </Link>
                      <DeleteExperienceButton id={e.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
