"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/app/actions/settings";
import type { SiteSettingsData } from "@/app/lib/settings-db";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card/40 p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" id="name" value={name} onChange={setName} />
        <Field label="Job title" id="jobTitle" value={jobTitle} onChange={setJobTitle} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" id="email" value={email} onChange={setEmail} type="email" />
        <Field label="Phone" id="phone" value={phone} onChange={setPhone} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="LinkedIn URL" id="linkedin" value={linkedinUrl} onChange={setLinkedinUrl} />
        <Field label="GitHub URL" id="github" value={githubUrl} onChange={setGithubUrl} />
      </div>

      {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[12.5px] text-success">Saved</span>}
      </div>
    </form>
  );
}

function Field({
  label, id, value, onChange, type = "text",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-card border border-border px-3.5 py-2.5 text-[14px] text-foreground focus:outline-none focus:border-ring transition-colors"
      />
    </div>
  );
}
