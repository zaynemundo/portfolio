import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { toggleProjectPublished } from "../../actions/admin-projects";
import { DeleteProjectButton } from "./DeleteProjectButton";

export const metadata: Metadata = { title: "Works" };

export default async function ProjectsAdminPage() {
  let projects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  try {
    projects = await prisma.project.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    /* DB not yet migrated */
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-extrabold text-zinc-950 tracking-tight mb-1">Works &amp; Case Studies</h1>
          <p className="text-[13.5px] text-zinc-500 font-medium">{projects.length} case studies in database</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold hover:bg-blue-600 transition-colors shadow-2xs"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add New Work
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-16 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="#2563eb" strokeWidth="1.5"/></svg>
          </div>
          <p className="text-[15px] font-bold text-zinc-900 mb-1">No works published yet</p>
          <p className="text-[13px] text-zinc-500 mb-5">Add your first case study or work to populate the portfolio library.</p>
          <Link href="/admin/projects/new" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors">
            Add First Work →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] px-6 py-3.5">#</th>
                <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] px-6 py-3.5">Work</th>
                <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] px-6 py-3.5 hidden md:table-cell">Type</th>
                <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] px-6 py-3.5 hidden md:table-cell">Year</th>
                <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-6 py-4 text-[12px] text-zinc-400 font-mono font-medium">{p.sortOrder + 1}</td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-bold text-zinc-900">{p.name}</p>
                    <p className="text-[11.5px] font-mono text-zinc-400 mt-0.5">{p.slug}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                      p.workType === "Full-time"
                        ? "bg-blue-50 text-blue-700"
                        : p.workType === "Personal Project"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-purple-50 text-purple-700"
                    }`}>
                      {p.workType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 hidden md:table-cell">{p.year}</td>
                  <td className="px-6 py-4">
                    <form action={toggleProjectPublished.bind(null, p.id, !p.published)}>
                      <button type="submit" className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-colors ${
                        p.published
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}>
                        {p.published ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/admin/projects/${p.id}`} className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        Edit
                      </Link>
                      <DeleteProjectButton id={p.id} name={p.name} />
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

