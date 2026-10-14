"use client";

import { useState, useTransition } from "react";
import { updateFeaturedProjects } from "@/app/actions/projects";
import { Select } from "@/app/(admin)/_components/Select";
import { Film, Pencil } from "lucide-react";
import { Section, Field, areaClass } from "@/app/(admin)/_components/Section";
import { TileGridEditor } from "@/app/(admin)/_components/TileGridEditor";
import { AddTile } from "@/app/(admin)/_components/Tile";
import { MediaUploadField } from "@/app/(admin)/_components/MediaUploadField";

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

  /** The grid hands back the featured list in its new order (or without a removed one). */
  function setFeatured(next: FeaturedPickerProject[]) {
    const order = new Map(next.map((p, i) => [p.id, i]));
    setProjects((prev) =>
      prev.map((p) => {
        const i = order.get(p.id);
        if (i === undefined) return p.featured ? { ...p, featured: false } : p;
        return { ...next[i], featured: true, sortOrder: i };
      }),
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
    <Section title="Featured projects" save={{ onSave: handleSave, pending: isPending, saved, label: "Save featured projects" }}>
      {/* Two to a row, in carousel order. Click a tile to change the clip, poster and description. */}
      <TileGridEditor
        items={featured}
        onChange={setFeatured}
        itemLabel="Project"
        keyOf={(p) => p.id}
        compact
        saveHint="Save featured projects"
        titleOf={(p) => p.name}
        renderPreview={(p, i) => <FeaturedPreview project={p} index={i} />}
        renderEditor={(p, update) => (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <MediaUploadField label="Video" kind="video" folder="featured" value={p.videoMp4} onChange={(url) => update({ videoMp4: url })} />
              <MediaUploadField label="Poster image" kind="image" folder="featured" value={p.poster} onChange={(url) => update({ poster: url })} />
            </div>
            <Field label="Short description">
              <textarea value={p.shortDescription} onChange={(e) => update({ shortDescription: e.target.value })} rows={5} className={areaClass} />
            </Field>
          </>
        )}
        addTile={
          available.length > 0 && (
            <AddTile as="div" label="Add a project" minHeight={200}>
              <Select
                value=""
                onChange={addFeatured}
                placeholder="Choose a published case study…"
                options={available.map((p) => ({ value: p.id, label: p.name }))}
                className="w-full max-w-xs flex items-center justify-between gap-2 rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] font-normal text-foreground hover:border-ring transition-colors"
              />
            </AddTile>
          )
        }
      />
    </Section>
  );
}

/** A featured project's tile: the poster (or the clip until there is one), its name and description. */
function FeaturedPreview({ project, index }: { project: FeaturedPickerProject; index: number }) {
  return (
    <>
      <span className="group relative block aspect-video overflow-hidden rounded-lg bg-muted">
        {project.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.poster} alt="" className="h-full w-full object-cover" />
        ) : project.videoMp4 ? (
          <video src={project.videoMp4} muted playsInline preload="metadata" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
            <Film size={16} />
            Add a clip and poster
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">{index + 1}</span>
        {project.videoMp4 && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            <Film size={11} />
            Clip
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 text-[12.5px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Pencil size={13} />
          Edit
        </span>
      </span>
      <span className="block px-1 pt-2.5">
        <span className="block text-[13.5px] font-semibold text-foreground">{project.name}</span>
        <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-muted-foreground">{project.shortDescription || "No description yet."}</span>
      </span>
    </>
  );
}
