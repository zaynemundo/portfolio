import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { StatusBadge } from "./StatusBadge";
import { PageHeader } from "@/app/dashboard/components/PageHeader";
import { EmptyState } from "@/app/dashboard/components/EmptyState";
import { routes } from "@/app/dashboard/routes";

const STATUS_ORDER = ["ACTIVE", "ON_HOLD", "NOT_STARTED", "COMPLETED"];

export default async function FreelanceProjectsPage() {
  const projects = await prisma.freelanceProject.findMany({
    where: { archived: false },
    include: { tasks: true },
    orderBy: { updatedAt: "desc" },
  });

  const sorted = [...projects].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  return (
    <div>
      <PageHeader
        title="Freelance Projects"
        subtitle={`${projects.length} active project${projects.length === 1 ? "" : "s"}`}
        actionHref={routes.projects.new}
        actionLabel="+ New project"
      />

      {sorted.length === 0 ? (
        <EmptyState message="No freelance projects yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sorted.map((project) => {
            const doneCount = project.tasks.filter((t) => t.done).length;
            const totalCount = project.tasks.length;
            const isOverdue = project.deadline && project.deadline < new Date() && project.status !== "COMPLETED";

            return (
              <Link
                key={project.id}
                href={routes.projects.item(project.id)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[14.5px] font-semibold text-zinc-100">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                {project.client && <p className="text-[12.5px] text-zinc-500 mb-3">{project.client}</p>}

                <div className="flex items-center justify-between text-[12px] text-zinc-500">
                  <span>
                    {totalCount > 0 ? `${doneCount}/${totalCount} tasks done` : "No tasks yet"}
                  </span>
                  {project.deadline && (
                    <span className={isOverdue ? "text-red-400 font-medium" : ""}>
                      {isOverdue ? "Overdue: " : "Due "}
                      {project.deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>

                {totalCount > 0 && (
                  <div className="mt-2.5 h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(doneCount / totalCount) * 100}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
