import { getSiteSettings } from "@/app/lib/settings-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { BlogPageCopyForm } from "./BlogPageCopyForm";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

export default async function BlogPageSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <BackLink href={routes.blog.list} label="Blog" iconOnly />
      <div className="mt-4">
        <PageHeader title="Insights page" subtitle="The banner on /insights. Articles are managed in the Blog list." secondaryHref="/insights" secondaryLabel="View on site" secondaryNewTab />
      </div>

      <BlogPageCopyForm initialHeading={settings.blogPageHeading} initialIntro={settings.blogPageIntro} />
    </div>
  );
}
