import { prisma } from "@/app/lib/prisma";
import { getSiteSettings } from "@/app/lib/settings-db";
import { HomepageSubNav } from "../HomepageSubNav";
import { SelectedWorkCopyForm } from "./SelectedWorkCopyForm";
import { FeaturedProjectsPicker } from "./FeaturedProjectsPicker";

export default async function SelectedWorkPage() {
  const settings = await getSiteSettings();
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, featured: true, sortOrder: true, videoMp4: true, poster: true, shortDescription: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Homepage</h1>
      <p className="text-[13px] text-zinc-500 mb-6">Selected Work section heading and featured case studies.</p>
      <HomepageSubNav />

      <div className="space-y-8">
        <SelectedWorkCopyForm initialHeading={settings.selectedWorkHeading} initialIntro={settings.selectedWorkIntro} />

        <FeaturedProjectsPicker
          initial={projects.map((p) => ({
            id: p.id,
            name: p.name,
            featured: p.featured,
            sortOrder: p.sortOrder,
            videoMp4: p.videoMp4 ?? "",
            poster: p.poster ?? "",
            shortDescription: p.shortDescription,
          }))}
        />
      </div>
    </div>
  );
}
