"use client";

import { useState, useTransition } from "react";
import { updateBlogPageCopy } from "@/app/actions/settings";
import { Section, Field, fieldClass, areaClass } from "@/app/(admin)/_components/Section";

export function BlogPageCopyForm({ initialHeading, initialIntro }: { initialHeading: string; initialIntro: string }) {
  const [heading, setHeading] = useState(initialHeading);
  const [intro, setIntro] = useState(initialIntro);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateBlogPageCopy({ heading, intro });
      setSaved(true);
    });
  }

  return (
    <Section title="Page header" save={{ onSave: save, pending: isPending, saved }}>
      <Field label="Heading" htmlFor="blogHeading">
        <input id="blogHeading" type="text" value={heading} onChange={(e) => setHeading(e.target.value)} className={fieldClass} />
      </Field>
      <Field label="Intro text" htmlFor="blogIntro">
        <textarea id="blogIntro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={areaClass} />
      </Field>
    </Section>
  );
}
