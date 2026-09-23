"use client";

import { useState, useTransition } from "react";
import { updateFeaturedProjects } from "@/app/actions/projects";

export interface FeaturedPickerProject {
  id: string;
  name: string;
  featured: boolean;
  sortOrder: number;
  videoMp4: string;
  poster: string;
  shortDescription: string;
}

export function FeaturedProjectsPicker({ initial }: { initial: FeaturedPickerProject[] }) {
  const [projects, setProjects] = useState(initial);
  const [pickerValue, setPickerValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const featured = projects.filter((p) => p.featured).sort((a, b) => a.sortOrder - b.sortOrder);
  const available = projects.filter((p) => !p.featured);

  function addFeatured(id: string) {
    if (!id) return;
    const maxOrder = featured.length > 0 ? Math.max(...featured.map((p) => p.sortOrder)) : -1;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, featured: true, sortOrder: maxOrder + 1 } : p)));
    setPickerValue("");
  }

  function removeFeatured(id: string) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, featured: false } : p)));
  }

  function updateField(id: string, patch: Partial<FeaturedPickerProject>) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function move(id: string, direction: -1 | 1) {
    const ordered = [...featured];
    const idx = ordered.findIndex((p) => p.id === id);
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= ordered.length) return;
    const a = ordered[idx];
    const b = ordered[swapWith];
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === a.id) return { ...p, sortOrder: b.sortOrder };
        if (p.id === b.id) return { ...p, sortOrder: a.sortOrder };
        return p;
      })
    );
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateFeaturedProjects(
        projects.map((p) => ({
          id: p.id,
          featured: p.featured,
          sortOrder: p.sortOrder,
          videoMp4: p.videoMp4,
          poster: p.poster,
          shortDescription: p.shortDescription,
        }))
      );
      setSaved(true);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">Featured projects</h2>
        <p className="text-[12.5px] text-zinc-500">
          Pick which case studies appear in the homepage&rsquo;s Selected Work carousel, and set the video/short description shown there. Reorder with the arrows.
        </p>
      </div>

      {available.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={pickerValue}
            onChange={(e) => addFeatured(e.target.value)}
            className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[13.5px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="">+ Add a featured project…</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {featured.length === 0 ? (
        <p className="text-[13px] text-zinc-600 py-6 text-center border border-dashed border-zinc-800 rounded-lg">
          No featured projects yet — add one above.
        </p>
      ) : (
        <div className="space-y-3">
          {featured.map((p, i) => (
            <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-semibold text-zinc-100">{p.name}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => move(p.id, -1)} disabled={i === 0} className="text-[12px] text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors">↑</button>
                  <button type="button" onClick={() => move(p.id, 1)} disabled={i === featured.length - 1} className="text-[12px] text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-colors">↓</button>
                  <button type="button" onClick={() => removeFeatured(p.id)} className="text-[12px] text-red-400 hover:text-red-300 transition-colors">Remove</button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Video (MP4 URL)</label>
                <input
                  type="text"
                  value={p.videoMp4}
                  onChange={(e) => updateField(p.id, { videoMp4: e.target.value })}
                  placeholder="https://…/clip.mp4"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Poster image URL</label>
                <input
                  type="text"
                  value={p.poster}
                  onChange={(e) => updateField(p.id, { poster: e.target.value })}
                  placeholder="https://…/poster.jpg"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Short description</label>
                <textarea
                  value={p.shortDescription}
                  onChange={(e) => updateField(p.id, { shortDescription: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save featured projects"}
        </button>
        {saved && <span className="text-[12.5px] text-emerald-400">Saved</span>}
      </div>
    </div>
  );
}
