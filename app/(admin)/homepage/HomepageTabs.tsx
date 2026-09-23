"use client";

import { useState } from "react";
import Link from "next/link";
import type { HeroSceneData } from "@/app/lib/settings-db";
import type { Chapter } from "@/app/data/aboutChapters";
import { UploadCard } from "@/app/(admin)/_components/UploadCard";
import { uploadHeroVideo, uploadHeroPoster } from "@/app/actions/settings";
import { HeroScenesForm } from "./HeroScenesForm";
import { SelectedWorkCopyForm } from "./SelectedWorkCopyForm";
import { FeaturedProjectsPicker, type FeaturedPickerProject } from "./FeaturedProjectsPicker";
import { ProfileForm } from "./ProfileForm";
import { InsightsCopyForm } from "./InsightsCopyForm";
import { routes } from "@/app/(admin)/_routes";

type Tab = "hero" | "selected-work" | "about" | "insights";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Hero Banner" },
  { id: "selected-work", label: "Selected Work" },
  { id: "about", label: "About" },
  { id: "insights", label: "Insights" },
];

interface Props {
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroScenes: HeroSceneData[];
  selectedWorkHeading: string;
  selectedWorkIntro: string;
  projects: FeaturedPickerProject[];
  profile: Chapter;
  insightsHeading: string;
  insightsIntro: string;
}

/**
 * All 4 homepage sections in one page, switched client-side with local
 * state instead of separate routes — each tab used to be its own page,
 * which meant a fresh database round-trip on every click. Loading
 * everything once here makes tab switching instant.
 */
export function HomepageTabs(props: Props) {
  const [tab, setTab] = useState<Tab>("hero");

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Homepage</h1>
      <p className="text-[13px] text-zinc-500 mb-6">Every section of the public homepage.</p>

      <div className="flex items-center gap-1 mb-8 border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-purple-400 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <UploadCard
              title="Banner video"
              description="MP4 or WebM, scrubbed as the visitor scrolls through the hero"
              currentUrl={props.heroVideoUrl}
              accept="video/mp4,video/webm"
              kind="video"
              uploadAction={uploadHeroVideo}
            />
            <UploadCard
              title="Poster frame"
              description="JPG, PNG, or WebP, shown before the video loads"
              currentUrl={props.heroPosterUrl}
              accept="image/jpeg,image/png,image/webp"
              kind="image"
              uploadAction={uploadHeroPoster}
            />
          </div>
          <HeroScenesForm initial={props.heroScenes} />
        </div>
      )}

      {tab === "selected-work" && (
        <div className="space-y-8">
          <SelectedWorkCopyForm initialHeading={props.selectedWorkHeading} initialIntro={props.selectedWorkIntro} />
          <FeaturedProjectsPicker initial={props.projects} />
        </div>
      )}

      {tab === "about" && (
        <div className="space-y-8">
          <ProfileForm chapter={props.profile} />
          <p className="text-[12.5px] text-zinc-500 rounded-lg border border-dashed border-zinc-800 px-4 py-3">
            What I Do, Experience, and Education &amp; Skills live on the{" "}
            <Link href={routes.cv} className="text-purple-400 hover:text-purple-300">CV</Link> page instead —
            they&rsquo;re your resume content, not homepage-specific copy.
          </p>
        </div>
      )}

      {tab === "insights" && (
        <div className="space-y-6">
          <p className="text-[12.5px] text-zinc-500 rounded-lg border border-dashed border-zinc-800 px-4 py-3">
            The 3 articles shown here are always the latest published posts from the Blog — nothing to configure, just publish an article and it appears automatically.
          </p>
          <InsightsCopyForm initialHeading={props.insightsHeading} initialIntro={props.insightsIntro} />
        </div>
      )}
    </div>
  );
}
