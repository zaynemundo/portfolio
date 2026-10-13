"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/app/actions/settings";
import type { SiteSettingsData } from "@/app/lib/settings-db";
import { Section, Field, fieldClass } from "@/app/(admin)/_components/Section";

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
      description="Your name and job title as they appear across the site, and the contact details and links in the footer and contact section."
      save={{ onSave: save, pending: isPending, saved, error }}
    >
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

function TextField({ label, id, value, onChange, type = "text" }: { label: string; id: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <Field label={label} htmlFor={id}>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </Field>
  );
}
