import { getSiteSettings } from "@/app/lib/settings-db";
import { HomepageSubNav } from "../HomepageSubNav";
import { InsightsCopyForm } from "./InsightsCopyForm";

export default async function InsightsHomepagePage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Homepage</h1>
      <p className="text-[13px] text-zinc-500 mb-6">Insights section heading and intro copy.</p>
      <HomepageSubNav />

      <div className="space-y-6">
        <p className="text-[12.5px] text-zinc-500 rounded-lg border border-dashed border-zinc-800 px-4 py-3">
          The 3 articles shown here are always the latest published posts from the Blog — nothing to configure, just publish an article and it appears automatically.
        </p>
        <InsightsCopyForm initialHeading={settings.insightsHeading} initialIntro={settings.insightsIntro} />
      </div>
    </div>
  );
}
