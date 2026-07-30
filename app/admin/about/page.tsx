import type { Metadata } from "next";
import { getSettings } from "../../actions/admin-profile";
import { AboutForm } from "./AboutForm";

export const metadata: Metadata = { title: "About & Profile" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[24px] font-extrabold text-zinc-950 tracking-tight mb-1">About &amp; Profile</h1>
        <p className="text-[13.5px] text-zinc-500 font-medium">
          Manage your public bio text, portrait photo, and downloadable CV document used on the portfolio.
        </p>
      </div>
      <AboutForm
        aboutText={settings?.aboutText ?? ""}
        portraitUrl={settings?.portraitUrl ?? null}
        cvPath={settings?.cvPath ?? "/docs/zaira-mundo-cv.pdf"}
      />
    </div>
  );
}

