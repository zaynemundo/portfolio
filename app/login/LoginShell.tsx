"use client";

import { useEffect, useState } from "react";

// Must match ConsoleShell.tsx's THEME_STORAGE_KEY — same admin theme preference.
const THEME_STORAGE_KEY = "zm-admin-theme";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** Wraps every unauthenticated admin page (login, forgot, reset) in the same
 *  .admin-root design-token scope and brand header ConsoleShell uses, so the
 *  sign-in flow matches the rest of the admin instead of being stuck on the
 *  old hardcoded dark theme. Respects the visitor's stored theme preference. */
export function LoginShell({ title, subtitle, children }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount; can't be derived during render without a hydration mismatch.
      setIsDark(localStorage.getItem(THEME_STORAGE_KEY) === "dark");
    } catch {
      // localStorage unavailable — stay on the light default.
    }
  }, []);

  return (
    <div className={`admin-root ${isDark ? "dark" : ""} min-h-screen bg-background flex flex-col items-center justify-center px-6`}>
      <div className="w-full max-w-sm mb-8 text-center">
        <span className="text-[14px] font-extrabold tracking-tight text-foreground">ZM</span>
        <h1 className="mt-4 text-[20px] font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}
