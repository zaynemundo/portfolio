"use client";

import { useState, useTransition } from "react";
import { updateHomepageContent } from "@/app/actions/settings";
import type { SiteSettingsData } from "@/app/lib/settings-db";

export function HomepageContentForm({ initial }: { initial: SiteSettingsData }) {
  const [name, setName] = useState(initial.name);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [heroScenesJson, setHeroScenesJson] = useState(JSON.stringify(initial.heroScenes, null, 2));
  const [aboutChaptersJson, setAboutChaptersJson] = useState(JSON.stringify(initial.aboutChapters, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateHomepageContent({ name, jobTitle, heroScenesJson, aboutChaptersJson });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">Homepage content</h2>
        <p className="text-[12.5px] text-zinc-500">
          Name, job title, hero scroll copy, and About story chapters — everything shown on the homepage.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" id="name" value={name} onChange={setName} />
        <Field label="Job title" id="jobTitle" value={jobTitle} onChange={setJobTitle} />
      </div>

      <div>
        <label htmlFor="heroScenesJson" className="block text-xs font-medium text-zinc-400 mb-1.5">
          Hero scroll scenes (JSON)
        </label>
        <p className="text-[11.5px] text-zinc-600 mb-2">
          Array of {"{ heading, description?, ctaLabel?, ctaHref?, start, end }"} — start/end are scroll-progress fractions (0–1) tied to the hero video.
        </p>
        <textarea
          id="heroScenesJson"
          value={heroScenesJson}
          onChange={(e) => setHeroScenesJson(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[12.5px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
        />
      </div>

      <div>
        <label htmlFor="aboutChaptersJson" className="block text-xs font-medium text-zinc-400 mb-1.5">
          About story chapters (JSON)
        </label>
        <p className="text-[11.5px] text-zinc-600 mb-2">
          Array of chapter objects shown in the scroll-driven About section — see app/data/aboutChapters.ts for the shape.
        </p>
        <textarea
          id="aboutChaptersJson"
          value={aboutChaptersJson}
          onChange={(e) => setAboutChaptersJson(e.target.value)}
          rows={16}
          spellCheck={false}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[12.5px] font-mono text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
        />
      </div>

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[12.5px] text-emerald-400">Saved</span>}
      </div>
    </form>
  );
}

function Field({
  label, id, value, onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
      />
    </div>
  );
}
