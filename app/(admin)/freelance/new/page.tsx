import { prisma } from "@/app/lib/prisma";
import { ProjectForm } from "../ProjectForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

export default async function NewFreelanceProjectPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <BackLink href={routes.projects.list} label="Freelance Projects" iconOnly />
      <div className="mt-4">
        <ProjectForm clients={clients} />
      </div>
    </div>
  );
}
