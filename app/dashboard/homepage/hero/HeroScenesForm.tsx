"use client";

import { useState, useTransition } from "react";
import { updateHeroScenes } from "@/app/actions/settings";
import type { HeroSceneData } from "@/app/lib/settings-db";

function emptyScene(): HeroSceneData {
  return { heading: "", description: "", ctaLabel: "", ctaHref: "", start: 0, end: 0 };
}

export function HeroScenesForm({ initial }: { initial: HeroSceneData[] }) {
  const [scenes, setScenes] = useState<HeroSceneData[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateScene(i: number, patch: Partial<HeroSceneData>) {
    setScenes((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addScene() {
    setScenes((prev) => [...prev, emptyScene()]);
  }

  function removeScene(i: number) {
    setScenes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateHeroScenes(scenes);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">Scroll scenes</h2>
        <p className="text-[12.5px] text-zinc-500">
          Each scene&rsquo;s heading/description appears as the visitor scrolls through the hero video. Start/end are the scroll-progress fractions (0–1) where the scene is visible — leave them evenly spaced across the video&rsquo;s scroll range.
        </p>
      </div>

      <div className="space-y-4">
        {scenes.map((scene, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Scene {i + 1}</span>
              <button
                type="button"
                onClick={() => removeScene(i)}
                className="text-[12px] text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>

            <Field label="Heading" value={scene.heading} onChange={(v) => updateScene(i, { heading: v })} />
            <TextArea label="Description (optional)" value={scene.description ?? ""} onChange={(v) => updateScene(i, { description: v })} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA label (optional)" value={scene.ctaLabel ?? ""} onChange={(v) => updateScene(i, { ctaLabel: v })} placeholder="Get in touch" />
              <Field label="CTA link (optional)" value={scene.ctaHref ?? ""} onChange={(v) => updateScene(i, { ctaHref: v })} placeholder="#contact" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Start (0–1)" value={scene.start} onChange={(v) => updateScene(i, { start: v })} />
              <NumberField label="End (0–1)" value={scene.end} onChange={(v) => updateScene(i, { end: v })} />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addScene}
        className="w-full rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-[13px] font-medium py-2.5 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
      >
        + Add scene
      </button>

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save scenes"}
        </button>
        {saved && <span className="text-[12.5px] text-emerald-400">Saved</span>}
      </div>
    </form>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
      />
    </div>
  );
}

function TextArea({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
      />
    </div>
  );
}

function NumberField({
  label, value, onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
      />
    </div>
  );
}
