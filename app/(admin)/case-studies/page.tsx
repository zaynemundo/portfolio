import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { ProjectPublishToggle } from "./ProjectPublishToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { FeaturedBadge } from "@/app/(admin)/_components/FeaturedBadge";
import { routes } from "@/app/(admin)/_routes";

export default async function CaseStudiesPage() {
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageHeader
        title="Case Studies"
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        actionHref={routes.caseStudies.new}
        actionLabel="+ New case study"
      />

      {projects.length === 0 ? (
        <EmptyState message="No case studies yet." />
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
                      href={routes.caseStudies.item(project.id)}
                      className="text-[13.5px] font-medium text-zinc-100 hover:text-purple-400 transition-colors"
                    >
                      {project.name}
                    </Link>
                    {project.featured && <FeaturedBadge />}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{project.category}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{project.year}</td>
                  <td className="px-4 py-3">
                    <ProjectPublishToggle id={project.id} published={project.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={routes.caseStudies.item(project.id)}
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
