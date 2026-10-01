import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { ProjectForm } from "../ProjectForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ id: string }>;
}

const getCaseStudy = unstable_cache(
  (id: string) => prisma.project.findUnique({ where: { id } }),
  ["case-study-detail"],
  { tags: [CACHE_TAGS.caseStudies], revalidate: 60 }
);

export default async function EditCaseStudyPage({ params }: Props) {
  const { id } = await params;
  const project = await getCaseStudy(id);
  if (!project) notFound();

  const theme = (project.theme ?? {}) as { bg?: string };
  const logo = (project.logo ?? {}) as { initials?: string; bg?: string };

  return (
    <div>
      <BackLink href={routes.caseStudies.list} label="Case Studies" iconOnly />
      <div className="mt-6">
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
    </div>
  );
}
