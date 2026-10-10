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

  const theme = (project.theme ?? {}) as { bg?: string; dark?: boolean };
  const logo = (project.logo ?? {}) as { src?: string; initials?: string; bg?: string; light?: boolean };

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
            accessibility: project.accessibility ?? "",
            performance: project.performance ?? "",
            seo: project.seo ?? "",
            client: project.client ?? "",
            liveUrl: project.liveUrl ?? "",
            imageAlt: project.imageAlt,
            imageLabels: project.imageLabels.join("\n"),
            themeBg: theme.bg ?? "#f4f4f5",
            themeDark: theme.dark ?? false,
            logoInitials: logo.initials ?? "",
            logoBg: logo.bg ?? "#e5e5e5",
            logoLight: logo.light ?? false,
            logoSrc: logo.src ?? "",
            richContentJson: JSON.stringify(project.richContent, null, 2),
            featured: project.featured,
            published: project.published,
          }}
        />
      </div>
    </div>
  );
}
