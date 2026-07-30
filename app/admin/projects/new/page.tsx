import type { Metadata } from "next";
import { createProject } from "../../../actions/admin-projects";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = { title: "New Project" };

export default function NewProjectPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-[22px] font-bold text-zinc-900 mb-1">New project</h1>
      <p className="text-zinc-500 text-[13px] mb-8">Add a project to the database.</p>
      <ProjectForm action={createProject} />
    </div>
  );
}
