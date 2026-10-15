import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { StatusBadge } from "./StatusBadge";
import { JOB_STATUS } from "@/app/(admin)/_components/ui/StatusPill";
import { FreelanceCardMenu } from "./FreelanceCardMenu";
import { PageTable } from "@/app/(admin)/_components/ui/DataTable";
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
      nextAction: p.nextAction ?? "",
      clientName: p.clientRecord?.name ?? null,
      status: p.status,
      archived: p.archived,
      endTime: endDate ? endDate.getTime() : null,
      displayEndDate: endDate ? endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
      isOverdue: !!(endDate && endDate < now && p.status !== "COMPLETED"),
      doneCount,
      totalCount,
    };
  });

  const inProgress = projects.filter((p) => p.status !== "COMPLETED").length;
  const completed = projects.length - inProgress;
  const subtitle = [
    `${inProgress} in progress`,
    completed ? `${completed} completed` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle={subtitle}
        actionHref={routes.projects.new}
        actionLabel="+ New job"
      />

      {projects.length === 0 ? (
        <EmptyState message="No jobs yet. Start one with “New job”." />
      ) : (
        <PageTable
          searchPlaceholder="Search by name, client or next action…"
          filters={[{ key: "status", label: "Status", options: STATUS_ORDER.map((status) => ({ value: status, label: JOB_STATUS[status].label })) }]}
          columns={[{ label: "Name" }, { label: "Client" }, { label: "Status" }, { label: "Next action" }, { label: "Tasks" }, { label: "Due date" }, { className: "w-12" }]}
          rows={projects.map((project) => ({
            id: project.id,
            className: "group relative",
            search: `${project.name} ${project.clientName ?? ""} ${project.nextAction}`,
            sort: [
              project.name,
              project.clientName,
              STATUS_ORDER.indexOf(project.status),
              project.nextAction || null,
              project.totalCount > 0 ? project.doneCount / project.totalCount : null,
              project.endTime,
              undefined,
            ],
            filters: { status: project.status },
            cells: (
              <>
              <td className="px-4 py-3 text-[13.5px] font-medium text-foreground group-hover:text-primary transition-colors">
                <Link href={routes.projects.item(project.id)} className="absolute inset-0 z-0" aria-label={`Open ${project.name}`} />
                <span className="relative pointer-events-none">{project.name}</span>
              </td>
              <td className="px-4 py-3 text-[13px] text-muted-foreground">{project.clientName ?? "—"}</td>
              <td className="px-4 py-3 pointer-events-none">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-[13px] text-foreground/80">{project.nextAction || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <span className="whitespace-nowrap">{project.totalCount > 0 ? `${project.doneCount}/${project.totalCount}` : "No tasks"}</span>
                  {project.totalCount > 0 && (
                    <div className="w-16 h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${(project.doneCount / project.totalCount) * 100}%` }} />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-[13px]">
                {project.displayEndDate ? (
                  <span className={project.isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
                    {project.isOverdue ? "Overdue: " : ""}
                    {project.displayEndDate}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 relative z-10">
                <FreelanceCardMenu id={project.id} name={project.name} archived={project.archived} />
              </td>
              </>
            ),
          }))}
        />
      )}
    </div>
  );
}
