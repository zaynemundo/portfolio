"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="flex items-center gap-1.5 text-[12.5px] font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
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
