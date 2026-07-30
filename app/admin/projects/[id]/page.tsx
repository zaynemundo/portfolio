import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateProject } from "../../../actions/admin-projects";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const action = updateProject.bind(null, id);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Edit project</h1>
      <p className="text-zinc-500 text-[13px] mb-8">{project.name}</p>
      <ProjectForm project={project} action={action} />
    </div>
  );
}
