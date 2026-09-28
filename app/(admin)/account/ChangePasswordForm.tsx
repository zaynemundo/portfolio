"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/app/actions/auth";
import { PasswordField } from "@/app/login/PasswordField";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 max-w-md">
      <div>
        <label htmlFor="currentPassword" className="block text-xs font-medium text-zinc-400 mb-1.5">Current password</label>
        <PasswordField id="currentPassword" value={currentPassword} onChange={setCurrentPassword} />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-xs font-medium text-zinc-400 mb-1.5">New password</label>
        <PasswordField id="newPassword" value={newPassword} onChange={setNewPassword} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm new password</label>
        <PasswordField id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} />
      </div>

      {error && <p className="text-[13px] text-red-400" role="alert">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-100 text-zinc-900 text-[13.5px] font-semibold px-4 py-2 hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Change password"}
        </button>
        {saved && <span className="text-[12.5px] text-emerald-400">Password updated. Other devices are signed out.</span>}
      </div>
    </form>
  );
}
