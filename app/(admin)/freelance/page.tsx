import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
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
    const deadline = p.deadline ? new Date(p.deadline) : null;
    const doneCount = p.tasks.filter((t) => t.done).length;
    const totalCount = p.tasks.length;
    return {
      id: p.id,
      name: p.name,
      clientName: p.clientRecord?.name ?? null,
      status: p.status,
      archived: p.archived,
      displayDeadline: deadline ? deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
      isOverdue: !!(deadline && deadline < now && p.status !== "COMPLETED"),
      doneCount,
      totalCount,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-100">Freelance Projects</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{projects.length} active project{projects.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href={routes.projects.new}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors"
        >
          + New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No freelance projects yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
            >
              <Link href={routes.projects.item(project.id)} className="absolute inset-0 z-0" aria-label={`Open ${project.name}`} />

              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-[14.5px] font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors pointer-events-none">{project.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="pointer-events-none">
                    <StatusBadge status={project.status} />
                  </span>
                  <div className="relative z-10">
                    <FreelanceCardMenu id={project.id} name={project.name} archived={project.archived} />
                  </div>
                </div>
              </div>
              {project.clientName && <p className="text-[12.5px] text-zinc-500 mb-3 pointer-events-none">{project.clientName}</p>}

              <div className="flex items-center justify-between text-[12px] text-zinc-500 pointer-events-none">
                <span>{project.totalCount > 0 ? `${project.doneCount}/${project.totalCount} tasks done` : "No tasks yet"}</span>
                {project.displayDeadline && (
                  <span className={project.isOverdue ? "text-red-400 font-medium" : ""}>
                    {project.isOverdue ? "Overdue: " : "Due "}
                    {project.displayDeadline}
                  </span>
                )}
              </div>

              {project.totalCount > 0 && (
                <div className="mt-2.5 h-1 rounded-full bg-zinc-800 overflow-hidden pointer-events-none">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(project.doneCount / project.totalCount) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
