import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { ProjectForm } from "../ProjectForm";
import { BackLink } from "@/app/dashboard/components/BackLink";
import { routes } from "@/app/dashboard/routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCaseStudyPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const theme = (project.theme ?? {}) as { bg?: string };
  const logo = (project.logo ?? {}) as { initials?: string; bg?: string };

  return (
    <div>
      <BackLink href={routes.caseStudies.list} label="Case Studies" />
      <h1 className="text-[22px] font-semibold text-zinc-100 mt-1 mb-8">Edit case study</h1>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        images={project.images}
        initial={{
          name: project.name,
          slug: project.slug,
          tagline: project.tagline,
          shortDescription: project.shortDescription,
          role: project.role,
          category: project.category,
          year: project.year,
          workType: project.workType ?? "Freelance",
          technologies: project.technologies.join(", "),
          challenge: project.challenge,
          approach: project.approach,
          outcome: project.outcome,
          highlights: project.highlights.join("\n"),
          client: project.client ?? "",
          liveUrl: project.liveUrl ?? "",
          imageAlt: project.imageAlt,
          themeBg: theme.bg ?? "#f4f4f5",
          logoInitials: logo.initials ?? "",
          logoBg: logo.bg ?? "#e5e5e5",
          richContentJson: JSON.stringify(project.richContent, null, 2),
          featured: project.featured,
          published: project.published,
        }}
      />
    </div>
  );
}
