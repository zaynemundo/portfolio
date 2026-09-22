"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await requestPasswordReset(email);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-[14px] text-zinc-300">
          If that email is registered, a reset link is on its way. Check your inbox.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="mb-6">
        <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-zinc-100 text-zinc-900 text-[14px] font-semibold py-2.5 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending…" : "Send reset link"}
      </button>

      <Link
        href="/login"
        className="mt-4 block text-center text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        ← Back to sign in
      </Link>
    </form>
  );
}
