import { getSiteSettings } from "@/app/lib/settings-db";
import { getClientLogos } from "@/app/lib/client-logos-db";
import { WorkPageCopyForm } from "./WorkPageCopyForm";
import { ClientLogosManager } from "./ClientLogosManager";

export default async function WorkPageSettingsPage() {
  const settings = await getSiteSettings();
  const logos = await getClientLogos();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Work Page</h1>
      <p className="text-[13px] text-zinc-500 mb-8">The header banner and client logo marquee on /work.</p>

      <div className="space-y-8">
        <WorkPageCopyForm initialHeading={settings.workPageHeading} initialIntro={settings.workPageIntro} />
        <ClientLogosManager initial={logos} />
      </div>
    </div>
  );
}
