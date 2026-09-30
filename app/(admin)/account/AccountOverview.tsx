"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/components/console/ThemeContext";
import { Switch } from "@/app/(admin)/_components/ui/Switch";
import { LogoutButton } from "@/app/(admin)/_components/LogoutButton";

export function AccountOverview({ email }: { email: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[15px] font-semibold shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-foreground font-medium truncate">{email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="flex items-center gap-2 text-[13.5px] font-medium text-foreground/80">
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
          {isDark ? "Dark mode" : "Light mode"}
        </span>
        <Switch checked={isDark} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
      </div>
    </div>
  );
}
