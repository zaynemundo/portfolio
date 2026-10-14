"use client";

import { useState } from "react";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}

export function PasswordField({ id, value, onChange, autoComplete, placeholder }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none w-full rounded-lg bg-card border border-border px-3.5 py-2.5 pr-10 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-ring transition-colors"
        placeholder={placeholder ?? "••••••••"}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5l15 15M8.35 8.4a2.25 2.25 0 0 0 3.24 3.2M6.05 6.1C3.68 7.55 1.5 10 1.5 10s3 6 8.5 6c1.6 0 2.96-.5 4.08-1.16M11.9 4.2c-.6-.13-1.24-.2-1.9-.2C4.5 4 1.5 10 1.5 10a15 15 0 0 0 2.13 2.9m11.44-1.02C16.44 10.7 18.5 10 18.5 10s-.72-1.45-2.13-2.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
