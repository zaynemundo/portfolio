import { getSiteSettings } from "@/app/lib/settings-db";
import { HomepageSubNav } from "../HomepageSubNav";
import { HeroScenesForm } from "./HeroScenesForm";
import { UploadCard } from "@/app/dashboard/components/UploadCard";
import { uploadHeroVideo, uploadHeroPoster } from "@/app/actions/settings";

export default async function HeroPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Homepage</h1>
      <p className="text-[13px] text-zinc-500 mb-6">Hero banner video and scroll-scene copy.</p>
      <HomepageSubNav />

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <UploadCard
            title="Banner video"
            description="MP4 or WebM, scrubbed as the visitor scrolls through the hero"
            currentUrl={settings.heroVideoUrl}
            accept="video/mp4,video/webm"
            kind="video"
            uploadAction={uploadHeroVideo}
          />
          <UploadCard
            title="Poster frame"
            description="JPG, PNG, or WebP, shown before the video loads"
            currentUrl={settings.heroPosterUrl}
            accept="image/jpeg,image/png,image/webp"
            kind="image"
            uploadAction={uploadHeroPoster}
          />
        </div>

        <HeroScenesForm initial={settings.heroScenes} />
      </div>
    </div>
  );
}
