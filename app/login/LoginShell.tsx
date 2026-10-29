"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  readStoredTheme,
  useSystemDark,
  type ThemePreference,
} from "@/app/components/console/ThemeContext";
import { LoginArtwork } from "./LoginArtwork";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** Wraps every unauthenticated admin page (login, forgot, reset): the whole
 *  screen split in two, the form on the left and an abstract violet artwork
 *  filling the right (the artwork drops away on phones). Uses the same .admin-root
 *  design tokens as ConsoleShell and the visitor's stored theme, so it follows
 *  Light / Dark / Auto like the rest of the admin. */
function subscribeNever() {
  return () => {};
}

export function LoginShell({ title, subtitle, children }: Props) {
  const [theme, setTheme] = useState<ThemePreference>("light");
  const systemDark = useSystemDark();
  const isDark = theme === "dark" || (theme === "system" && systemDark);

  // The forms are drawn only in the browser. Password managers add their own
  // icons to the email and password boxes before React takes over, and when
  // the server had already drawn those boxes React reported a hydration
  // mismatch. These pages are noindex, so nothing is lost by skipping the
  // server copy of the form.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount; can't be derived during render without a hydration mismatch.
    setTheme(readStoredTheme());
  }, []);

  return (
    <div
      className={`admin-root ${isDark ? "dark" : ""} min-h-screen bg-background grid md:grid-cols-2`}
    >
      <div className="min-h-screen flex flex-col px-6 py-8 sm:px-12 sm:py-10">
        {/* Set like the favicon; takes you to the public site. */}
        <Link
          href="/"
          aria-label="Go to the homepage"
          title="Go to the homepage"
          className="self-start text-[22px] font-extrabold tracking-[-0.04em] text-foreground hover:opacity-70 transition-opacity"
        >
          ZM
        </Link>

        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto py-10">
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 mb-8 text-[14px] text-muted-foreground">
            {subtitle}
          </p>
          {hydrated ? children : <div className="min-h-[280px]" aria-hidden="true" />}
        </div>

        <Link
          href="/"
          className="self-start text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to the website
        </Link>
      </div>

      <div className="hidden md:block h-screen sticky top-0 overflow-hidden">
        <LoginArtwork isDark={isDark} />
        <div className={`absolute inset-x-0 bottom-0 p-12 lg:p-16 ${isDark ? "text-white" : "text-[#1e1035]"}`}>
          <p className="max-w-md text-[34px] lg:text-[40px] font-bold leading-[1.1] tracking-tight">
            Good to see you again, Zayne.
          </p>
          <p className={`mt-3 max-w-sm text-[15px] leading-relaxed ${isDark ? "text-white/70" : "text-[#1e1035]/70"}`}>
            Everything for zairamundo.com and your clients is inside.
          </p>
        </div>
      </div>
    </div>
  );
}
