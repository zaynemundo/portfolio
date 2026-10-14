"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { updateSiteSettings } from "@/app/actions/settings";
import type { SiteSettingsData } from "@/app/lib/settings-db";
import { Section, Field, fieldClass } from "@/app/(admin)/_components/Section";
import { PortraitField } from "./PortraitField";

export function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [name, setName] = useState(initial.name);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSiteSettings({ name, jobTitle, email, phone, linkedinUrl, githubUrl });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
    });
  }

  return (
    <Section
      title="Identity and contact"
      save={{ onSave: save, pending: isPending, saved, error }}
    >
      <div className="border-b border-border pb-4">
        <PortraitField currentUrl={initial.portraitUrl} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Name" id="name" value={name} onChange={setName} />
        <TextField label="Job title" id="jobTitle" value={jobTitle} onChange={setJobTitle} />
        <TextField label="Email" id="email" value={email} onChange={setEmail} type="email" />
        <TextField label="Phone" id="phone" value={phone} onChange={setPhone} />
        <TextField label="LinkedIn link" id="linkedin" value={linkedinUrl} onChange={setLinkedinUrl} />
        <TextField label="GitHub link" id="github" value={githubUrl} onChange={setGithubUrl} />
      </div>
    </Section>
  );
}

const noSubscribe = () => () => {};

function TextField({ label, id, value, onChange, type = "text" }: { label: string; id: string; value: string; onChange: (v: string) => void; type?: string }) {
  // Password managers add an icon and a button to the email box before React
  // loads, which breaks hydration. The server sends a look-alike box instead,
  // and the real input appears once the page is running.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  return (
    <Field label={label} htmlFor={id}>
      {hydrated ? (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" data-lpignore="true" data-1p-ignore="" className={fieldClass} />
      ) : (
        <div aria-hidden className={`${fieldClass} truncate`}>{value || "\u00a0"}</div>
      )}
    </Field>
  );
}
