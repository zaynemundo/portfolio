"use client";

import { useState, useTransition } from "react";
import { updateSelectedWorkCopy } from "@/app/actions/settings";
import { Section, Field, fieldClass, areaClass } from "@/app/(admin)/_components/Section";

export function SelectedWorkCopyForm({ initialHeading, initialIntro }: { initialHeading: string; initialIntro: string }) {
  const [heading, setHeading] = useState(initialHeading);
  const [intro, setIntro] = useState(initialIntro);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateSelectedWorkCopy({ heading, intro });
      setSaved(true);
    });
  }

  return (
    <Section title="Heading and intro" save={{ onSave: save, pending: isPending, saved }}>
      <Field label="Section heading" htmlFor="selectedWorkHeading">
        <input id="selectedWorkHeading" type="text" value={heading} onChange={(e) => setHeading(e.target.value)} className={fieldClass} />
      </Field>
      <Field label="Intro text" htmlFor="selectedWorkIntro">
        <textarea id="selectedWorkIntro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={areaClass} />
      </Field>
    </Section>
  );
}
