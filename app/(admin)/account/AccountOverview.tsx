"use client";

import { useTheme } from "@/app/components/console/ThemeContext";
import type { ThemePreference } from "@/app/components/console/ThemeContext";
import { LogoutButton } from "@/app/(admin)/_components/LogoutButton";

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
];

/** Fixed colours, not theme tokens: each thumbnail must always show its own
 *  look, whatever the admin is currently in. */
const PREVIEW_COLORS = {
  light: { canvas: "#f4f4f5", sheet: "#ffffff", line: "#d4d4d8", accent: "#7c3aed" },
  dark: { canvas: "#18181b", sheet: "#27272a", line: "#3f3f46", accent: "#a78bfa" },
};

/** A tiny drawing of the admin: grey canvas, sidebar lines, and the sheet with a couple of rows. */
function MiniAdmin({ mode }: { mode: "light" | "dark" }) {
  const c = PREVIEW_COLORS[mode];
  return (
    <div className="absolute inset-0 flex gap-1 p-1.5" style={{ background: c.canvas }}>
      <div className="w-[26%] flex flex-col gap-1 pt-0.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />
        <span className="h-1 w-full rounded-full" style={{ background: c.accent }} />
        <span className="h-1 w-3/4 rounded-full" style={{ background: c.line }} />
        <span className="h-1 w-4/5 rounded-full" style={{ background: c.line }} />
      </div>
      <div className="flex-1 rounded-md p-1.5 flex flex-col gap-1" style={{ background: c.sheet }}>
        <span className="h-1.5 w-1/2 rounded-full" style={{ background: c.line }} />
        <span className="h-1 w-full rounded-full" style={{ background: c.line }} />
        <span className="h-1 w-5/6 rounded-full" style={{ background: c.line }} />
      </div>
    </div>
  );
}

function AppearancePreview({ value }: { value: ThemePreference }) {
  if (value !== "system") return <MiniAdmin mode={value} />;
  // Auto: the left half light, the right half dark.
  return (
    <>
      <MiniAdmin mode="light" />
      <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }}>
        <MiniAdmin mode="dark" />
      </div>
    </>
  );
}

export function AccountOverview({ email }: { email: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card shadow-xs p-4">
        <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[15px] font-semibold shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-foreground font-medium truncate">{email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-xl border border-border bg-card shadow-xs p-4">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground">Appearance</h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">Auto follows your computer&apos;s setting.</p>
        </div>
        <div role="radiogroup" aria-label="Appearance" className="flex gap-3">
          {APPEARANCE_OPTIONS.map((option) => {
            const selected = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(option.value)}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className={`relative block h-14 w-20 overflow-hidden rounded-lg border transition-shadow ${
                    selected ? "border-transparent ring-2 ring-primary ring-offset-2 ring-offset-card" : "border-border group-hover:ring-2 group-hover:ring-border"
                  }`}
                >
                  <AppearancePreview value={option.value} />
                </span>
                <span className={`text-[12.5px] ${selected ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
