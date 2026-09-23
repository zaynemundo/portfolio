import { ProjectForm } from "../ProjectForm";

export default function NewFreelanceProjectPage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New freelance project</h1>
      <ProjectForm mode="new" />
    </div>
  );
}
