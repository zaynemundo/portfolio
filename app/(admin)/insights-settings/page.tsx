import { getSiteSettings } from "@/app/lib/settings-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { BlogPageCopyForm } from "./BlogPageCopyForm";

export default async function BlogPageSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="Insights page" subtitle="The banner on /insights. Articles are managed in the Blog list." secondaryHref="/insights" secondaryLabel="View on site" secondaryNewTab />

      <BlogPageCopyForm initialHeading={settings.blogPageHeading} initialIntro={settings.blogPageIntro} />
    </div>
  );
}
