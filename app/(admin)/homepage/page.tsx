import { prisma } from "@/app/lib/prisma";
import { getSiteSettings } from "@/app/lib/settings-db";
import { HomepageTabs } from "./HomepageTabs";

export default async function HomepagePage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, featured: true, sortOrder: true, videoMp4: true, poster: true, shortDescription: true },
    }),
  ]);

  return (
    <HomepageTabs
      heroVideoUrl={settings.heroVideoUrl}
      heroPosterUrl={settings.heroPosterUrl}
      heroScenes={settings.heroScenes}
      selectedWorkHeading={settings.selectedWorkHeading}
      selectedWorkIntro={settings.selectedWorkIntro}
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        featured: p.featured,
        sortOrder: p.sortOrder,
        videoMp4: p.videoMp4 ?? "",
        poster: p.poster ?? "",
        shortDescription: p.shortDescription,
      }))}
      insightsHeading={settings.insightsHeading}
      insightsIntro={settings.insightsIntro}
    />
  );
}
