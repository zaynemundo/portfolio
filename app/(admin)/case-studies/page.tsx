import Link from "next/link";
import { Pencil } from "lucide-react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { ProjectPublishToggle } from "./ProjectPublishToggle";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { FeaturedBadge } from "@/app/(admin)/_components/FeaturedBadge";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
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
        <div className={`${cardClass} p-5`}>
          <DataTable
            inset={false}
            toolbar="always"
            searchPlaceholder="Search by name, category or year…"
            filters={[{ key: "status", label: "Status", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }]}
            columns={[{ label: "Name" }, { label: "Category" }, { label: "Year" }, { label: "Published" }, { className: "w-12" }]}
            rows={projects.map((project) => ({
              id: project.id,
              href: routes.caseStudies.item(project.id),
              search: `${project.name} ${project.category} ${project.year}`,
              sort: [project.name, project.category, project.year, project.published ? "Published" : "Draft", undefined],
              filters: { status: project.published ? "published" : "draft" },
              cells: (
                <>
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
                  <RowMenu>
                    <RowMenuItem href={routes.caseStudies.item(project.id)} icon={<Pencil size={14} />}>
                      Edit
                    </RowMenuItem>
                    <DeleteProjectButton id={project.id} name={project.name} menu />
                  </RowMenu>
                </td>
                </>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
