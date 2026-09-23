import { getSiteSettings } from "@/app/lib/settings-db";
import { BlogPageCopyForm } from "./BlogPageCopyForm";

export default async function BlogPageSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Insights Page</h1>
      <p className="text-[13px] text-zinc-500 mb-8">
        The header banner on /insights. Articles are managed on the Blog page.
      </p>

      <BlogPageCopyForm initialHeading={settings.blogPageHeading} initialIntro={settings.blogPageIntro} />
    </div>
  );
}
