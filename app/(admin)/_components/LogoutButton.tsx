"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="text-[11px] font-medium text-destructive/80 hover:text-destructive transition-colors disabled:opacity-50"
    >
      Sign out
    </button>
  );
}
