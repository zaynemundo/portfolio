import type { Metadata } from "next";
import { createExperience } from "../../../actions/admin-experience";
import { ExperienceForm } from "../ExperienceForm";

export const metadata: Metadata = { title: "Add Experience" };

export default function NewExperiencePage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Add experience entry</h1>
        <p className="text-[14px] text-zinc-500">Employment, education, or certification.</p>
      </div>
      <ExperienceForm action={createExperience} />
    </div>
  );
}
