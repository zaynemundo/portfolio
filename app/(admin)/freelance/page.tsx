import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { StatusBadge } from "./StatusBadge";
import { FreelanceCardMenu } from "./FreelanceCardMenu";
import { routes } from "@/app/(admin)/_routes";

const STATUS_ORDER = ["ACTIVE", "ON_HOLD", "NOT_STARTED", "COMPLETED"];

const getFreelanceData = unstable_cache(
  () =>
    prisma.freelanceProject.findMany({
      where: { archived: false },
      include: { tasks: { orderBy: { sortOrder: "asc" } }, clientRecord: true },
      orderBy: { updatedAt: "desc" },
    }),
  ["freelance-list"],
  { tags: [CACHE_TAGS.freelance, CACHE_TAGS.clients], revalidate: 60 }
);

export default async function FreelanceProjectsPage() {
  const rows = await getFreelanceData();
  const now = new Date();

  const sorted = [...rows].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  const projects = sorted.map((p) => {
    // unstable_cache round-trips through JSON, so Date fields come back as strings.
    const endDate = p.endDate ? new Date(p.endDate) : null;
    const doneCount = p.tasks.filter((t) => t.done).length;
    const totalCount = p.tasks.length;
    return {
      id: p.id,
      name: p.name,
      clientName: p.clientRecord?.name ?? null,
      status: p.status,
      archived: p.archived,
      displayEndDate: endDate ? endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
      isOverdue: !!(endDate && endDate < now && p.status !== "COMPLETED"),
      doneCount,
      totalCount,
    };
  });

  return (
    <div>
      <PageHeader
        title="Freelance Projects"
        subtitle={`${projects.length} active project${projects.length === 1 ? "" : "s"}`}
        actionHref={routes.projects.new}
        actionLabel="+ New project"
      />

      {projects.length === 0 ? (
        <EmptyState message="No freelance projects yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-xl border border-border bg-card/40 p-5 hover:border-border transition-colors"
            >
              <Link href={routes.projects.item(project.id)} className="absolute inset-0 z-0" aria-label={`Open ${project.name}`} />

              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-[14.5px] font-semibold text-foreground group-hover:text-primary transition-colors pointer-events-none">{project.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="pointer-events-none">
                    <StatusBadge status={project.status} />
                  </span>
                  <div className="relative z-10">
                    <FreelanceCardMenu id={project.id} name={project.name} archived={project.archived} />
                  </div>
                </div>
              </div>
              {project.clientName && <p className="text-[12.5px] text-muted-foreground mb-3 pointer-events-none">{project.clientName}</p>}

              <div className="flex items-center justify-between text-[12px] text-muted-foreground pointer-events-none">
                <span>{project.totalCount > 0 ? `${project.doneCount}/${project.totalCount} tasks done` : "No tasks yet"}</span>
                {project.displayEndDate && (
                  <span className={project.isOverdue ? "text-destructive font-medium" : ""}>
                    {project.isOverdue ? "Overdue: " : "Due "}
                    {project.displayEndDate}
                  </span>
                )}
              </div>

              {project.totalCount > 0 && (
                <div className="mt-2.5 h-1 rounded-full bg-secondary overflow-hidden pointer-events-none">
                  <div className="h-full bg-success rounded-full" style={{ width: `${(project.doneCount / project.totalCount) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
