import { getSiteSettings } from "@/app/lib/settings-db";
import { aboutChapters as DEFAULT_CHAPTERS } from "@/app/data/aboutChapters";
import { HomepageSubNav } from "../HomepageSubNav";
import { ProfileForm } from "./ProfileForm";
import { routes } from "@/app/(admin)/_routes";
import Link from "next/link";

function findChapter(chapters: typeof DEFAULT_CHAPTERS, id: string) {
  return chapters.find((c) => c.id === id) ?? DEFAULT_CHAPTERS.find((c) => c.id === id)!;
}

export default async function AboutPage() {
  const { aboutChapters } = await getSiteSettings();
  const profile = findChapter(aboutChapters, "profile");

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Homepage</h1>
      <p className="text-[13px] text-zinc-500 mb-6">The opening chapter of the scroll-driven About section.</p>
      <HomepageSubNav />

      <div className="space-y-8">
        <ProfileForm chapter={profile} />
        <p className="text-[12.5px] text-zinc-500 rounded-lg border border-dashed border-zinc-800 px-4 py-3">
          What I Do, Experience, and Education &amp; Skills moved to{" "}
          <Link href={routes.settings} className="text-purple-400 hover:text-purple-300">CV</Link> — they&rsquo;re
          your resume content, not homepage-specific copy.
        </p>
      </div>
    </div>
  );
}
