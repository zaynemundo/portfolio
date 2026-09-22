import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ProjectForm } from "../ProjectForm";
import { TaskList } from "../TaskList";
import { ProjectActions } from "../ProjectActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FreelanceProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.freelanceProject.findUnique({
    where: { id },
    include: { tasks: { orderBy: { sortOrder: "asc" } } },
  });
  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/projects" className="text-[12.5px] text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Freelance Projects
          </Link>
          <h1 className="text-[22px] font-semibold text-zinc-100 mt-1">{project.name}</h1>
        </div>
        <ProjectActions id={project.id} archived={project.archived} />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-10">
        <ProjectForm
          mode="edit"
          projectId={project.id}
          initial={{
            name: project.name,
            client: project.client ?? "",
            status: project.status,
            rate: project.rate ?? "",
            deadline: project.deadline ? project.deadline.toISOString().slice(0, 10) : "",
            description: project.description ?? "",
          }}
        />

        <TaskList projectId={project.id} tasks={project.tasks} />
      </div>
    </div>
  );
}
