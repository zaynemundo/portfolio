import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { ProjectPublishToggle } from "./ProjectPublishToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { FeaturedBadge } from "@/app/(admin)/_components/FeaturedBadge";
import { routes } from "@/app/(admin)/_routes";

const getCaseStudies = unstable_cache(
  () => prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
  ["case-studies-list"],
  { tags: [CACHE_TAGS.caseStudies], revalidate: 60 }
);

export default async function CaseStudiesPage() {
  const projects = await getCaseStudies();

  return (
    <div>
      <PageHeader
        title="Case Studies"
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        actionHref={routes.caseStudies.new}
        actionLabel="+ New case study"
        secondaryHref={routes.workPage}
        secondaryLabel="Edit Work page"
      />

      {projects.length === 0 ? (
        <EmptyState message="No case studies yet." />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Year</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                  <td className="px-4 py-3">
                    <Link
                      href={routes.caseStudies.item(project.id)}
                      className="text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {project.name}
                    </Link>
                    {project.featured && <FeaturedBadge />}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{project.category}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{project.year}</td>
                  <td className="px-4 py-3">
                    <ProjectPublishToggle id={project.id} published={project.published} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={routes.caseStudies.item(project.id)}
                        className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
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
