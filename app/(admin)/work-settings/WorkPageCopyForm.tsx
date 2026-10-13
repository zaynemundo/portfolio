"use client";

import { useState, useTransition } from "react";
import { updateWorkPageCopy } from "@/app/actions/settings";
import { Section, Field, fieldClass, areaClass } from "@/app/(admin)/_components/Section";

export function WorkPageCopyForm({ initialHeading, initialIntro }: { initialHeading: string; initialIntro: string }) {
  const [heading, setHeading] = useState(initialHeading);
  const [intro, setIntro] = useState(initialIntro);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateWorkPageCopy({ heading, intro });
      setSaved(true);
    });
  }

  return (
    <Section title="Page header" description="The dark banner heading and intro at the top of /work." save={{ onSave: save, pending: isPending, saved }}>
      <Field label="Heading" htmlFor="workHeading">
        <input id="workHeading" type="text" value={heading} onChange={(e) => setHeading(e.target.value)} className={fieldClass} />
      </Field>
      <Field label="Intro text" htmlFor="workIntro">
        <textarea id="workIntro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={areaClass} />
      </Field>
    </Section>
  );
}
