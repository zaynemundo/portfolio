"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { PasswordField } from "../PasswordField";

export function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(token, password);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    });
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-[14px] text-foreground/80">This reset link is missing its token.</p>
        <Link href="/login/forgot" className="mt-6 inline-block text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <p className="w-full max-w-sm text-center text-[14px] text-foreground/80">
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="mb-5">
        <label htmlFor="password" className="block text-xs font-medium text-muted-foreground mb-2">
          New password
        </label>
        <PasswordField
          id="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="confirm" className="block text-xs font-medium text-muted-foreground mb-2">
          Confirm password
        </label>
        <PasswordField
          id="confirm"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="mb-4 text-[13px] text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary text-primary-foreground text-[14px] font-semibold py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
