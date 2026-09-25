import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { ProjectForm } from "../ProjectForm";
import { TaskList } from "../TaskList";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
}

const getProjectDetail = unstable_cache(
  (id: string) =>
    Promise.all([
      prisma.freelanceProject.findUnique({
        where: { id },
        include: { tasks: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]),
  ["freelance-project-detail"],
  { tags: [CACHE_TAGS.freelance, CACHE_TAGS.clients], revalidate: 60 }
);

export default async function FreelanceProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const [project, clients] = await getProjectDetail(id);
  if (!project) notFound();

  // unstable_cache round-trips through JSON, so Date fields come back as strings.
  const deadline = project.deadline ? new Date(project.deadline) : null;

  return (
    <div>
      <BackLink href={routes.projects.list} label="Freelance Projects" iconOnly />

      <div className="grid grid-cols-[1fr_320px] gap-10 mt-4">
        <ProjectForm
          projectId={project.id}
          clients={clients}
          initial={{
            name: project.name,
            clientId: project.clientId ?? "",
            status: project.status,
            rateAmount: project.rateAmount != null ? String(project.rateAmount) : "",
            rateCurrency: project.rateCurrency ?? "AED",
            rateType: project.rateType ?? "",
            attachmentUrl: project.attachmentUrl ?? "",
            deadline: deadline ? deadline.toISOString().slice(0, 10) : "",
            description: project.description ?? "",
            archived: project.archived,
          }}
        />

        <TaskList projectId={project.id} tasks={project.tasks} />
      </div>
    </div>
  );
}
