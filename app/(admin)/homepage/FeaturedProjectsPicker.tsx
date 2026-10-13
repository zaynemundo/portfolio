"use client";

import { useState, useTransition } from "react";
import { updateFeaturedProjects } from "@/app/actions/projects";
import { Select } from "@/app/(admin)/_components/Select";
import { Section, Field, ItemCard, fieldClass, areaClass, labelClass } from "@/app/(admin)/_components/Section";

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
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const featured = projects.filter((p) => p.featured).sort((a, b) => a.sortOrder - b.sortOrder);
  const available = projects.filter((p) => !p.featured);

  function addFeatured(id: string) {
    if (!id) return;
    const maxOrder = featured.length > 0 ? Math.max(...featured.map((p) => p.sortOrder)) : -1;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, featured: true, sortOrder: maxOrder + 1 } : p)));
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
    <Section
      title="Featured projects"
      description="Which case studies appear in the Selected Work carousel, in what order, and the clip and one-line description shown for each."
      save={{ onSave: handleSave, pending: isPending, saved, label: "Save featured projects" }}
    >
      {featured.length === 0 && (
        <p className="rounded-xl border border-dashed border-border py-6 text-center text-[13px] text-muted-foreground">No featured projects yet. Add one below.</p>
      )}

      {featured.map((p, i) => (
        <ItemCard
          key={p.id}
          label={`${i + 1}.`}
          summary={p.name}
          onRemove={() => removeFeatured(p.id)}
          move={{ up: i > 0 ? () => move(p.id, -1) : undefined, down: i < featured.length - 1 ? () => move(p.id, 1) : undefined }}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Video (MP4 link)">
              <input type="text" value={p.videoMp4} onChange={(e) => updateField(p.id, { videoMp4: e.target.value })} placeholder="https://…/clip.mp4" className={fieldClass} />
            </Field>
            <Field label="Poster image link">
              <input type="text" value={p.poster} onChange={(e) => updateField(p.id, { poster: e.target.value })} placeholder="https://…/poster.jpg" className={fieldClass} />
            </Field>
          </div>
          <Field label="Short description">
            <textarea value={p.shortDescription} onChange={(e) => updateField(p.id, { shortDescription: e.target.value })} rows={2} className={areaClass} />
          </Field>
        </ItemCard>
      ))}

      {available.length > 0 && (
        <div>
          <span className={labelClass}>Add a project</span>
          <Select
            value=""
            onChange={addFeatured}
            placeholder="Choose a published case study…"
            options={available.map((p) => ({ value: p.id, label: p.name }))}
            className="w-full flex items-center justify-between gap-2 rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground hover:border-ring transition-colors"
          />
        </div>
      )}
    </Section>
  );
}
