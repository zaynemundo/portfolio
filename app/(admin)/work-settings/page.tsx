import { getSiteSettings } from "@/app/lib/settings-db";
import { getClientLogos } from "@/app/lib/client-logos-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { WorkPageCopyForm } from "./WorkPageCopyForm";
import { ClientLogosManager } from "./ClientLogosManager";

export default async function WorkPageSettingsPage() {
  const settings = await getSiteSettings();
  const logos = await getClientLogos();

  return (
    <div>
      <PageHeader title="Work Page" subtitle="The header banner and client logo marquee on /work." />

      <div className="space-y-8">
        <WorkPageCopyForm initialHeading={settings.workPageHeading} initialIntro={settings.workPageIntro} />
        <ClientLogosManager initial={logos} />
      </div>
    </div>
  );
}
