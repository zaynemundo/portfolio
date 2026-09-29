import { getSiteSettings } from "@/app/lib/settings-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { BlogPageCopyForm } from "./BlogPageCopyForm";

export default async function BlogPageSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-4xl">
      <PageHeader title="Insights Page" subtitle="The header banner on /insights. Articles are managed on the Blog page." />

      <BlogPageCopyForm initialHeading={settings.blogPageHeading} initialIntro={settings.blogPageIntro} />
    </div>
  );
}
