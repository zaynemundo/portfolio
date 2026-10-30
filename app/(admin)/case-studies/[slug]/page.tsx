import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { asStringArray } from "@/app/lib/json-array";
import { ProjectForm } from "../ProjectForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

interface Props {
  params: Promise<{ slug: string }>;
}

// Read fresh every time: an editing form must never open on an old copy,
// or saving it would put the old content back.
export const dynamic = "force-dynamic";

export default async function EditCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) {
    // Lists link by id (it never changes), so a cached list still opens the right
    // case study after its address is renamed: forward to the current address.
    const byId = await prisma.project.findUnique({ where: { id: slug }, select: { slug: true } });
    if (byId) redirect(routes.caseStudies.item(byId.slug));
    notFound();
  }

  const theme = (project.theme ?? {}) as { bg?: string; dark?: boolean };
  const logo = (project.logo ?? {}) as { src?: string; initials?: string; bg?: string; light?: boolean };

  return (
    <div>
      <BackLink href={routes.caseStudies.list} label="Case Studies" iconOnly />
      <div className="mt-6">
        <ProjectForm
          mode="edit"
          projectId={project.id}
          initial={{
            name: project.name,
            slug: project.slug,
            tagline: project.tagline,
            shortDescription: project.shortDescription,
            role: project.role,
            category: project.category,
            year: project.year,
            workType: project.workType ?? "Freelance",
            technologies: asStringArray(project.technologies).join(", "),
            challenge: project.challenge,
            approach: project.approach,
            outcome: project.outcome,
            highlights: asStringArray(project.highlights).join("\n"),
            accessibility: project.accessibility ?? "",
            performance: project.performance ?? "",
            seo: project.seo ?? "",
            client: project.client ?? "",
            liveUrl: project.liveUrl ?? "",
            imageAlt: project.imageAlt,
            images: asStringArray(project.images),
            imageLabels: asStringArray(project.imageLabels),
            imageAlts: asStringArray(project.imageAlts),
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
