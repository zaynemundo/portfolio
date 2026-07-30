import type { Metadata } from "next";
import { getSettings } from "../../actions/admin-profile";
import { saveLinks } from "../../actions/admin-profile";

export const metadata: Metadata = { title: "Links" };

const inp = "w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-colors";
const lbl = "block text-[12px] font-semibold text-zinc-600 mb-1.5";

export default async function LinksPage() {
  const settings = await getSettings();

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Links</h1>
        <p className="text-[14px] text-zinc-500">
          Your contact details and social profiles — used throughout the site and email templates.
        </p>
      </div>

      <form action={saveLinks} className="space-y-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-5">

          <div>
            <label className={lbl}>Email address</label>
            <input
              name="email"
              type="email"
              defaultValue={settings?.email ?? "mzaira.mundo@gmail.com"}
              placeholder="mzaira.mundo@gmail.com"
              className={inp}
            />
          </div>

          <div>
            <label className={lbl}>Phone number</label>
            <input
              name="phone"
              type="tel"
              defaultValue={settings?.phone ?? "+971 50 562 8417"}
              placeholder="+971 50 562 8417"
              className={inp}
            />
            <p className="text-[11px] text-zinc-400 mt-1">Include country code. Displayed in contact info.</p>
          </div>

          <div>
            <label className={lbl}>LinkedIn URL</label>
            <input
              name="linkedinUrl"
              type="url"
              defaultValue={settings?.linkedinUrl ?? "https://linkedin.com/in/zaira-mundo/"}
              placeholder="https://linkedin.com/in/zaira-mundo/"
              className={inp}
            />
          </div>

          <div>
            <label className={lbl}>GitHub URL</label>
            <input
              name="githubUrl"
              type="url"
              defaultValue={settings?.githubUrl ?? "https://github.com/mzaira"}
              placeholder="https://github.com/mzaira"
              className={inp}
            />
          </div>

        </div>

        <div className="pb-10">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            Save links
          </button>
        </div>
      </form>
    </div>
  );
}
