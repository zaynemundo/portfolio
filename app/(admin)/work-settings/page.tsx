import { getSiteSettings } from "@/app/lib/settings-db";
import { getClientLogos } from "@/app/lib/client-logos-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { WorkPageCopyForm } from "./WorkPageCopyForm";
import { ClientLogosManager } from "./ClientLogosManager";
import { SectionStack } from "@/app/(admin)/_components/Section";
import { BackLink } from "@/app/(admin)/_components/BackLink";
import { routes } from "@/app/(admin)/_routes";

export default async function WorkPageSettingsPage() {
  const settings = await getSiteSettings();
  const logos = await getClientLogos();

  return (
    <div>
      <BackLink href={routes.caseStudies.list} label="Work" />
      <div className="mt-4">
        <PageHeader title="Work page" subtitle="The banner and the client logos on /work. Case studies are managed in the Work list." secondaryHref="/work" secondaryLabel="View on site" secondaryNewTab />
      </div>

      <SectionStack>
        <WorkPageCopyForm initialHeading={settings.workPageHeading} initialIntro={settings.workPageIntro} />
        <ClientLogosManager initial={logos} />
      </SectionStack>
    </div>
  );
}
