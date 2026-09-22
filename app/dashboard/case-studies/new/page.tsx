import { ProjectForm } from "../ProjectForm";

export default function NewCaseStudyPage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New case study</h1>
      <ProjectForm mode="new" />
    </div>
  );
}
