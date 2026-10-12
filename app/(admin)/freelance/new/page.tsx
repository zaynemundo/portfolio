import { prisma } from "@/app/lib/prisma";
import { ProjectForm } from "../ProjectForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NewFreelanceProjectPage({ searchParams }: Props) {
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <BackLink href={routes.projects.list} label="Jobs" iconOnly />
      <div className="mt-4">
        <ProjectForm clients={clients} initial={clientId ? { clientId } : undefined} />
      </div>
    </div>
  );
}
