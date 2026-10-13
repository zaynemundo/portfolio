"use client";

import { useState } from "react";
import type { HeroSceneData } from "@/app/lib/settings-db";
import { UploadCard } from "@/app/(admin)/_components/UploadCard";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { uploadHeroVideo, uploadHeroPoster } from "@/app/actions/settings";
import { HeroScenesForm } from "./HeroScenesForm";
import { SelectedWorkCopyForm } from "./SelectedWorkCopyForm";
import { FeaturedProjectsPicker, type FeaturedPickerProject } from "./FeaturedProjectsPicker";
import { InsightsCopyForm } from "./InsightsCopyForm";
import { Section, SectionStack } from "@/app/(admin)/_components/Section";
import { tabBarClass, tabClass } from "@/app/(admin)/_components/ui/Card";

type Tab = "hero" | "selected-work" | "insights";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Hero banner" },
  { id: "selected-work", label: "Selected work" },
  { id: "insights", label: "Insights" },
];

interface Props {
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroScenes: HeroSceneData[];
  selectedWorkHeading: string;
  selectedWorkIntro: string;
  projects: FeaturedPickerProject[];
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
    <div>
      <PageHeader title="Home" subtitle="The public homepage, one section at a time." secondaryHref="/" secondaryLabel="View homepage" secondaryNewTab />

      <div className={tabBarClass} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            className={tabClass(tab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <SectionStack>
          <Section title="Banner media" description="The video that plays as a visitor scrolls through the top of the homepage, and the still image shown while it loads. Each uploads as soon as you choose a file." card={false}>
            <div className="grid sm:grid-cols-2 gap-4">
              <UploadCard
                title="Banner video"
                description="MP4 or WebM"
                currentUrl={props.heroVideoUrl}
                accept="video/mp4,video/webm"
                kind="video"
                uploadAction={uploadHeroVideo}
              />
              <UploadCard
                title="Poster frame"
                description="JPG, PNG or WebP"
                currentUrl={props.heroPosterUrl}
                accept="image/jpeg,image/png,image/webp"
                kind="image"
                uploadAction={uploadHeroPoster}
              />
            </div>
          </Section>
          <HeroScenesForm initial={props.heroScenes} />
        </SectionStack>
      )}

      {tab === "selected-work" && (
        <SectionStack>
          <SelectedWorkCopyForm initialHeading={props.selectedWorkHeading} initialIntro={props.selectedWorkIntro} />
          <FeaturedProjectsPicker initial={props.projects} />
        </SectionStack>
      )}

      {tab === "insights" && (
        <SectionStack>
          <InsightsCopyForm initialHeading={props.insightsHeading} initialIntro={props.insightsIntro} />
        </SectionStack>
      )}
    </div>
  );
}
