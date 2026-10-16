import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { getSiteSettings } from "@/app/lib/settings-db";
import { PageViewTracker } from "@/app/components/PageViewTracker";
import { ImageProtection } from "@/app/components/ImageProtection";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { resumeUrl } = await getSiteSettings();

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Nav cvPath={resumeUrl} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <PageViewTracker />
      <ImageProtection />
    </>
  );
}
