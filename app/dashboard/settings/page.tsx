import { getSiteSettings } from "@/app/lib/settings-db";
import { SettingsForm } from "./SettingsForm";
import { FileUploadCard } from "./FileUploadCard";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-semibold text-zinc-100 mb-1">Site Settings</h1>
      <p className="text-[13px] text-zinc-500 mb-8">
        Contact info and assets shown on the public site.
      </p>

      <div className="space-y-8">
        <SettingsForm initial={settings} />

        <div className="grid grid-cols-2 gap-4">
          <FileUploadCard
            title="Resume / CV"
            description="PDF, shown on the Resume download link"
            currentUrl={settings.resumeUrl}
            accept="application/pdf"
            kind="resume"
          />
          <FileUploadCard
            title="Portrait photo"
            description="JPG, PNG, or WebP, used in the About section"
            currentUrl={settings.portraitUrl}
            accept="image/jpeg,image/png,image/webp"
            kind="portrait"
          />
        </div>
      </div>
    </div>
  );
}
