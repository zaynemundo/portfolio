"use client";

import { useState, useTransition } from "react";
import { updateHeroScenes } from "@/app/actions/settings";
import type { HeroSceneData } from "@/app/lib/settings-db";
import { Section, Field, fieldClass, areaClass } from "@/app/(admin)/_components/Section";
import { TileGridEditor } from "@/app/(admin)/_components/TileGridEditor";

function emptyScene(): HeroSceneData {
  return { heading: "", description: "", ctaLabel: "", ctaHref: "", start: 0, end: 0 };
}

/* The words move; each place keeps its timing, so the scroll still runs in step. */
function reorderScenes(scenes: HeroSceneData[], from: number, to: number): HeroSceneData[] {
  const next = [...scenes];
  const [scene] = next.splice(from, 1);
  next.splice(to, 0, scene);
  return next.map((s, i) => ({ ...s, start: scenes[i].start, end: scenes[i].end }));
}

/* A new scene starts where the last one ends, so it has a sensible slot to adjust. */
function nextScene(scenes: HeroSceneData[]): HeroSceneData {
  const last = scenes[scenes.length - 1];
  const start = last ? Math.min(last.end, 1) : 0;
  return { ...emptyScene(), start, end: Math.min(start + 0.25, 1) };
}

export function HeroScenesForm({ initial }: { initial: HeroSceneData[] }) {
  const [scenes, setScenes] = useState<HeroSceneData[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
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
    <Section title="Scroll scenes" save={{ onSave: save, pending: isPending, saved, error, label: "Save scenes" }}>
      <TileGridEditor
        items={scenes}
        onChange={setScenes}
        itemLabel="Scene"
        newItem={nextScene}
        reorder={reorderScenes}
        saveHint="Save scenes"
        titleOf={(scene) => scene.heading}
        renderPreview={(scene) => <ScenePreview scene={scene} />}
        renderEditor={(scene, update) => (
          <>
            <Field label="Heading">
              <input type="text" value={scene.heading} onChange={(e) => update({ heading: e.target.value })} className={fieldClass} autoFocus />
            </Field>
            <Field label="Description (optional)">
              <textarea value={scene.description ?? ""} onChange={(e) => update({ description: e.target.value })} rows={4} className={areaClass} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Button label (optional)">
                <input type="text" value={scene.ctaLabel ?? ""} placeholder="Get in touch" onChange={(e) => update({ ctaLabel: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Button link (optional)">
                <input type="text" value={scene.ctaHref ?? ""} placeholder="#contact" onChange={(e) => update({ ctaHref: e.target.value })} className={fieldClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Shows from (0–1)">
                <input type="number" step="0.01" min="0" max="1" value={scene.start} onChange={(e) => update({ start: Number(e.target.value) })} className={fieldClass} />
              </Field>
              <Field label="Until (0–1)">
                <input type="number" step="0.01" min="0" max="1" value={scene.end} onChange={(e) => update({ end: Number(e.target.value) })} className={fieldClass} />
              </Field>
            </div>
            <p className="text-[12px] text-muted-foreground">How far through the hero scroll this scene shows: 0 is the top, 1 the end. A little overlap with the next scene makes a smooth cross-fade.</p>
          </>
        )}
      />
    </Section>
  );
}

/** A scene's tile: the heading, its button if it has one, and where in the scroll it shows. */
function ScenePreview({ scene }: { scene: HeroSceneData }) {
  const start = Math.max(0, Math.min(1, scene.start));
  const end = Math.max(start, Math.min(1, scene.end));
  return (
    <>
      <span className="block line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">{scene.heading || "No heading yet"}</span>
      {scene.ctaLabel && (
        <span className="mt-2 inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground/80">{scene.ctaLabel}</span>
      )}
      <span className="mt-3 block" aria-label={`Shows from ${start} to ${end} of the scroll`}>
        <span className="relative block h-1.5 rounded-full bg-muted">
          <span className="absolute inset-y-0 rounded-full bg-primary/70" style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }} />
        </span>
        <span className="mt-1 flex justify-between text-[10.5px] tabular-nums text-muted-foreground">
          <span>{start.toFixed(2)}</span>
          <span>{end.toFixed(2)}</span>
        </span>
      </span>
    </>
  );
}
