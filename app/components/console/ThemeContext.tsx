"use client";

import { createContext, useContext, useEffect, useState } from "react";

/** "system" follows the computer's own light/dark setting (shown as "Auto"). */
export type ThemePreference = "light" | "dark" | "system";

/** Shared by ConsoleShell and LoginShell — the same admin theme preference. */
export const THEME_STORAGE_KEY = "zm-admin-theme";

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "system") return stored;
  } catch {
    // localStorage unavailable — fall through to the light default.
  }
  return "light";
}

/** Whether the computer is currently in dark mode; updates live when it switches. */
export function useSystemDark(): boolean {
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the browser on mount; can't be read during render without a hydration mismatch.
    setSystemDark(query.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return systemDark;
}

interface ThemeContextValue {
  theme: ThemePreference;
  isDark: boolean;
  setTheme: (theme: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Reads the theme state ConsoleShell owns — only usable from a component rendered inside it (i.e. any admin page). */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be used within ConsoleShell");
  return ctx;
}
