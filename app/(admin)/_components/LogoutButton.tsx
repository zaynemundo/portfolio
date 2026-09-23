"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12.5px] font-semibold px-3 py-2 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30 transition-colors disabled:opacity-50"
    >
      <SignOutIcon />
      Sign out
    </button>
  );
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 13.5 17 10l-4-3.5M17 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
