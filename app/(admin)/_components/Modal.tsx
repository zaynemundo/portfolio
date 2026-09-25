"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

/** Shared modal shell for Hub-section forms (Clients, Finance, Invoices) — Notes
 *  and Freelance moved to full pages with Apple-Notes-style autosave; Content
 *  pages (Homepage/CV/Blog/Case Studies/Inquiries/Settings) stay full pages too. */
export function Modal({ open, onClose, title, children, maxWidthClassName = "max-w-lg" }: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh] px-4 pb-8 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${maxWidthClassName} rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-[15px] font-semibold text-zinc-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
