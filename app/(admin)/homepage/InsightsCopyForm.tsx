"use client";

import { useState, useTransition } from "react";
import { updateInsightsCopy } from "@/app/actions/settings";
import { Section, Field, areaClass } from "@/app/(admin)/_components/Section";

export function InsightsCopyForm({ initialHeading, initialIntro }: { initialHeading: string; initialIntro: string }) {
  const [heading, setHeading] = useState(initialHeading);
  const [intro, setIntro] = useState(initialIntro);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateInsightsCopy({ heading, intro });
      setSaved(true);
    });
  }

  return (
    <Section
      title="Heading and intro"
      description="The title and paragraph above the three articles on the homepage. The articles themselves are always your latest published posts, so there is nothing to choose here."
      save={{ onSave: save, pending: isPending, saved }}
    >
      <Field label="Section heading" htmlFor="insightsHeading">
        <textarea id="insightsHeading" value={heading} onChange={(e) => setHeading(e.target.value)} rows={2} className={areaClass} />
      </Field>
      <Field label="Intro text" htmlFor="insightsIntro">
        <textarea id="insightsIntro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={areaClass} />
      </Field>
    </Section>
  );
}
