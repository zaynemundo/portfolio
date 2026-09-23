"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="text-[12.5px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
    >
      Sign out
    </button>
  );
}
