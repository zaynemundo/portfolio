"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push(from);
      router.refresh();
    });
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

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-xs font-medium text-zinc-400">
            Password
          </label>
          <Link
            href="/login/forgot"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordField
          id="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="mb-4 text-[13px] text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-zinc-100 text-zinc-900 text-[14px] font-semibold py-2.5 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
