import { getSiteSettings } from "@/app/lib/settings-db";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { SettingsForm } from "./SettingsForm";
import { FileUploadCard } from "./FileUploadCard";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Name, contact info, and downloadable assets (resume, portrait) shown across the public site. Bio text and work history live on Homepage and CV instead."
      />

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
