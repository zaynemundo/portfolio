import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { ProjectPublishToggle } from "./ProjectPublishToggle";

export default async function CaseStudiesPage() {
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Case Studies</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{projects.length} project{projects.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href="/dashboard/case-studies/new"
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New case study
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-[14px] text-zinc-500 py-12 text-center border border-dashed border-zinc-800 rounded-xl">
          No case studies yet.
        </p>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Category</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Year</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/case-studies/${project.id}`}
                      className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors"
                    >
                      {project.name}
                    </Link>
                    {project.featured && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 align-middle">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{project.category}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{project.year}</td>
                  <td className="px-4 py-3">
                    <ProjectPublishToggle id={project.id} published={project.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/case-studies/${project.id}`}
                        className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteProjectButton id={project.id} name={project.name} />
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
