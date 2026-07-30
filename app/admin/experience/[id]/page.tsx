import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateExperience } from "../../../actions/admin-experience";
import { ExperienceForm } from "../ExperienceForm";

export const metadata: Metadata = { title: "Edit Experience" };

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let entry = null;
  try { entry = await prisma.experience.findUnique({ where: { id } }); } catch { /* DB */ }
  if (!entry) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Edit experience</h1>
        <p className="text-[14px] text-zinc-500">{entry.company}</p>
      </div>
      <ExperienceForm entry={entry} action={updateExperience.bind(null, id)} />
    </div>
  );
}
