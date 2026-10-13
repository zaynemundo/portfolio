"use client";

import { useState, useTransition } from "react";
import { updateHeroScenes } from "@/app/actions/settings";
import type { HeroSceneData } from "@/app/lib/settings-db";
import { Section, Field, ItemCard, AddItemButton, fieldClass, areaClass } from "@/app/(admin)/_components/Section";

function emptyScene(): HeroSceneData {
  return { heading: "", description: "", ctaLabel: "", ctaHref: "", start: 0, end: 0 };
}

export function HeroScenesForm({ initial }: { initial: HeroSceneData[] }) {
  const [scenes, setScenes] = useState<HeroSceneData[]>(initial);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateScene(i: number, patch: Partial<HeroSceneData>) {
    setScenes((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function removeScene(i: number) {
    setScenes((prev) => prev.filter((_, idx) => idx !== i));
    setCollapsed(new Set());
  }

  function toggleCollapsed(i: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

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
    <Section
      title="Scroll scenes"
      description="The headings that appear one after another as a visitor scrolls through the hero video. Start and end say how far through the scroll each one shows, from 0 (top) to 1 (end)."
      save={{ onSave: save, pending: isPending, saved, error, label: "Save scenes" }}
    >
      {scenes.map((scene, i) => (
        <ItemCard
          key={i}
          label={`Scene ${i + 1}`}
          summary={scene.heading}
          collapsed={collapsed.has(i)}
          onToggle={() => toggleCollapsed(i)}
          onRemove={() => removeScene(i)}
        >
          <Field label="Heading">
            <input type="text" value={scene.heading} onChange={(e) => updateScene(i, { heading: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Description (optional)">
            <textarea value={scene.description ?? ""} onChange={(e) => updateScene(i, { description: e.target.value })} rows={2} className={areaClass} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Button label (optional)">
              <input type="text" value={scene.ctaLabel ?? ""} placeholder="Get in touch" onChange={(e) => updateScene(i, { ctaLabel: e.target.value })} className={fieldClass} />
            </Field>
            <Field label="Button link (optional)">
              <input type="text" value={scene.ctaHref ?? ""} placeholder="#contact" onChange={(e) => updateScene(i, { ctaHref: e.target.value })} className={fieldClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start (0–1)">
              <input type="number" step="0.01" min="0" max="1" value={scene.start} onChange={(e) => updateScene(i, { start: Number(e.target.value) })} className={fieldClass} />
            </Field>
            <Field label="End (0–1)">
              <input type="number" step="0.01" min="0" max="1" value={scene.end} onChange={(e) => updateScene(i, { end: Number(e.target.value) })} className={fieldClass} />
            </Field>
          </div>
        </ItemCard>
      ))}
      <AddItemButton onClick={() => setScenes((prev) => [...prev, emptyScene()])}>Add scene</AddItemButton>
    </Section>
  );
}
