import { prisma } from "@/app/lib/prisma";
import { ProjectForm } from "../ProjectForm";

export default async function NewFreelanceProjectPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-8">New freelance project</h1>
      <ProjectForm mode="new" clients={clients} />
    </div>
  );
}
