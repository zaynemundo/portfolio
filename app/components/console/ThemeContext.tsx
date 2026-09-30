"use client";

import { createContext, useContext } from "react";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Reads the light/dark state ConsoleShell owns — only usable from a component rendered inside it (i.e. any admin page). */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be used within ConsoleShell");
  return ctx;
}
